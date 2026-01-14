class Nest < ApplicationRecord
  has_many :users
  has_many :missions, dependent: :destroy
  has_many :calendar_events, dependent: :destroy
  has_many :goals, dependent: :destroy
  has_many :transactions, dependent: :destroy
  
  validates :invite_code, uniqueness: true, allow_nil: true
end
