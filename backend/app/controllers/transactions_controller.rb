class TransactionsController < ApplicationController
  before_action :set_nest

  def index
    render json: @nest.transactions.order(date: :desc)
  end

  def create
    transaction = @nest.transactions.build(transaction_params)
    if transaction.save
      render json: transaction, status: :created
    else
      render json: { errors: transaction.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def set_nest
    @nest = Nest.find(params[:nest_id])
  end

  def transaction_params
    params.require(:transaction).permit(:title, :amount, :category, :date, :payer_id)
  end
end
