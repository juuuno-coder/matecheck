class MissionsController < ApplicationController
  before_action :set_nest

  def index
    render json: @nest.missions.order(created_at: :desc)
  end

  def create
    mission = @nest.missions.build(mission_params)
    if mission.save
      render json: mission, status: :created
    else
      render json: { errors: mission.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    mission = @nest.missions.find(params[:id])
    if mission.update(mission_params)
      render json: mission
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
    params.require(:mission).permit(:title, :is_completed, :assigned_to, :repeat, :image_url)
  end
end
