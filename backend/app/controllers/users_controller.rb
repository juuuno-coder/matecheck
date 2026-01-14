class UsersController < ApplicationController
  def create
    user = User.new(user_params)
    if user.save
      render json: { message: "User created successfully", user: user }, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    user = User.find_by(email: params[:email])
    if user && user.update(user_params)
      render json: { message: "Profile updated", user: user }, status: :ok
    else
      render json: { error: "User not found or update failed" }, status: :unprocessable_entity
    end
  end

  private

  def user_params
    params.require(:user).permit(:email, :password, :password_confirmation, :nickname, :avatar_id)
  end
end
