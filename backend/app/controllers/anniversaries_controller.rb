class AnniversariesController < ApplicationController
  before_action :set_nest

  def index
    @anniversaries = @nest.anniversaries.order(anniversary_date: :asc)
    render json: @anniversaries
  end

  def create
    @anniversary = @nest.anniversaries.build(anniversary_params)
    if @anniversary.save
      render json: @anniversary, status: :created
    else
      render json: { errors: @anniversary.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    @anniversary = @nest.anniversaries.find(params[:id])
    if @anniversary.update(anniversary_params)
      render json: @anniversary
    else
      render json: { errors: @anniversary.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @anniversary = @nest.anniversaries.find(params[:id])
    @anniversary.destroy
    head :no_content
  end

  private

  def set_nest
    @nest = Nest.find(params[:nest_id])
  end

  def anniversary_params
    params.require(:anniversary).permit(:title, :anniversary_date, :is_recurring, :category)
  end
end
