class CalendarEventsController < ApplicationController
  before_action :set_nest

  def index
    render json: @nest.calendar_events.order(date: :asc)
  end

  def create
    event = @nest.calendar_events.build(event_params)
    if event.save
      render json: event, status: :created
    else
      render json: { errors: event.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    event = @nest.calendar_events.find(params[:id])
    event.destroy
    head :no_content
  end

  private

  def set_nest
    @nest = Nest.find(params[:nest_id])
  end

  def event_params
    params.require(:calendar_event).permit(:title, :date, :end_date, :creator_id, :image_url, :event_type)
  end
end
