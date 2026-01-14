class User < ApplicationRecord
  has_secure_password
  belongs_to :nest, optional: true
  validates :email, presence: true, uniqueness: true
end
