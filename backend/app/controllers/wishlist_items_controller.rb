class WishlistItemsController < ApplicationController
  before_action :set_nest

  def index
    @wishlist_items = @nest.wishlist_items.order(created_at: :desc)
    render json: @wishlist_items
  end

  def create
    @wishlist_item = @nest.wishlist_items.build(wishlist_item_params)
    @wishlist_item.status ||= 'pending'
    
    if @wishlist_item.save
      render json: @wishlist_item, status: :created
    else
      render json: { errors: @wishlist_item.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    @wishlist_item = @nest.wishlist_items.find(params[:id])
    if @wishlist_item.update(wishlist_item_params)
      render json: @wishlist_item
    else
      render json: { errors: @wishlist_item.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @wishlist_item = @nest.wishlist_items.find(params[:id])
    @wishlist_item.destroy
    head :no_content
  end

  private

  def set_nest
    @nest = Nest.find(params[:nest_id])
  end

  def wishlist_item_params
    params.require(:wishlist_item).permit(:title, :quantity, :price, :status, :requester_id)
  end
end
