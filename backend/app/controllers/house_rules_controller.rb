class HouseRulesController < ApplicationController
  before_action :set_nest

  def index
    @house_rules = @nest.house_rules.where(is_active: true).order(priority: :asc)
    render json: @house_rules
  end

  def create
    @house_rule = @nest.house_rules.build(house_rule_params)
    @house_rule.is_active = true
    
    if @house_rule.save
      render json: @house_rule, status: :created
    else
      render json: { errors: @house_rule.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    @house_rule = @nest.house_rules.find(params[:id])
    if @house_rule.update(house_rule_params)
      render json: @house_rule
    else
      render json: { errors: @house_rule.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @house_rule = @nest.house_rules.find(params[:id])
    @house_rule.destroy
    head :no_content
  end

  private

  def set_nest
    @nest = Nest.find(params[:nest_id])
  end

  def house_rule_params
    params.require(:house_rule).permit(:title, :description, :rule_type, :priority)
  end
end
