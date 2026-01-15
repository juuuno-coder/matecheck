class AnnouncementsController < ApplicationController

  def index
    @announcements = Announcement.where('published_at <= ?', Time.current)
                                  .order(published_at: :desc)
    render json: @announcements
  end

  def show
    @announcement = Announcement.find(params[:id])
    render json: @announcement
  end
end
