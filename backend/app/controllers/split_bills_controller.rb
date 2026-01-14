class SplitBillsController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :set_nest

  def index
    @split_bills = @nest.split_bills.order(due_date: :desc)
    render json: @split_bills.map { |bill|
      bill.as_json.merge(
        per_person: bill.total_amount / @nest.members.count,
        member_count: @nest.members.count
      )
    }
  end

  def create
    @split_bill = @nest.split_bills.build(split_bill_params)
    @split_bill.is_paid = false
    @split_bill.split_method ||= 'equal'
    
    if @split_bill.save
      render json: @split_bill.as_json.merge(
        per_person: @split_bill.total_amount / @nest.members.count,
        member_count: @nest.members.count
      ), status: :created
    else
      render json: { errors: @split_bill.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    @split_bill = @nest.split_bills.find(params[:id])
    if @split_bill.update(split_bill_params)
      render json: @split_bill
    else
      render json: { errors: @split_bill.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @split_bill = @nest.split_bills.find(params[:id])
    @split_bill.destroy
    head :no_content
  end

  private

  def set_nest
    @nest = Nest.find(params[:nest_id])
  end

  def split_bill_params
    params.require(:split_bill).permit(:title, :total_amount, :bill_type, :due_date, :is_paid, :split_method)
  end
end
