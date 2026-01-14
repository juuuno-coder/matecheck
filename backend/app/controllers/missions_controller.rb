class MissionsController < ApplicationController
  before_action :set_nest

  def index
    render json: @nest.missions.includes(:assignees).order(created_at: :desc).as_json(include: :assignees)
  end

  def create
    mission = @nest.missions.build(mission_params.except(:assignee_ids))
    if mission.save
      if mission_params[:assignee_ids].present?
        mission.assignees = @nest.users.where(id: mission_params[:assignee_ids])
      end
      render json: mission.as_json(include: :assignees), status: :created
    else
      render json: { errors: mission.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    mission = @nest.missions.find(params[:id])
    if mission.update(mission_params.except(:assignee_ids))
      if mission_params[:assignee_ids].present?
        mission.assignees = @nest.users.where(id: mission_params[:assignee_ids])
      end
      render json: mission.as_json(include: :assignees)
    else
      render json: { errors: mission.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    mission = @nest.missions.find(params[:id])
    mission.destroy
    head :no_content
  end

  private

  def set_nest
    @nest = Nest.find(params[:nest_id])
  end

  def mission_params
    params.require(:mission).permit(:title, :is_completed, :repeat, :image_url, assignee_ids: [])
  end
end
