class ChoreRotationsController < ApplicationController
  before_action :set_nest

  def index
    @chore_rotations = @nest.chore_rotations.order(next_rotation_date: :asc)
    render json: @chore_rotations.map { |rotation|
      current_member = @nest.members.find_by(id: rotation.current_assignee_id)
      rotation.as_json.merge(
        current_assignee_name: current_member&.nickname || 'Unassigned',
        current_assignee_avatar: current_member&.avatar_id || 0
      )
    }
  end

  def create
    @chore_rotation = @nest.chore_rotations.build(chore_rotation_params)
    
    # Auto-assign first member if not specified
    if @chore_rotation.current_assignee_id.nil? && @nest.members.any?
      @chore_rotation.current_assignee_id = @nest.members.first.id
    end
    
    # Set next rotation date based on type
    @chore_rotation.next_rotation_date ||= calculate_next_rotation(@chore_rotation.rotation_type)
    
    if @chore_rotation.save
      render json: @chore_rotation, status: :created
    else
      render json: { errors: @chore_rotation.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def rotate
    @chore_rotation = @nest.chore_rotations.find(params[:id])
    members = @nest.members.order(:id)
    current_index = members.index { |m| m.id == @chore_rotation.current_assignee_id }
    
    next_index = (current_index + 1) % members.count
    @chore_rotation.current_assignee_id = members[next_index].id
    @chore_rotation.next_rotation_date = calculate_next_rotation(@chore_rotation.rotation_type)
    
    if @chore_rotation.save
      render json: @chore_rotation
    else
      render json: { errors: @chore_rotation.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @chore_rotation = @nest.chore_rotations.find(params[:id])
    @chore_rotation.destroy
    head :no_content
  end

  private

  def set_nest
    @nest = Nest.find(params[:nest_id])
  end

  def chore_rotation_params
    params.require(:chore_rotation).permit(:chore_name, :rotation_type, :current_assignee_id, :next_rotation_date)
  end

  def calculate_next_rotation(rotation_type)
    case rotation_type
    when 'daily'
      Date.today + 1.day
    when 'weekly'
      Date.today + 1.week
    when 'biweekly'
      Date.today + 2.weeks
    when 'monthly'
      Date.today + 1.month
    else
      Date.today + 1.week
    end
  end
end
