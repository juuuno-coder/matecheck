Rails.application.routes.draw do
  post '/signup', to: 'users#create'
  post '/login', to: 'sessions#create'
  patch '/profile', to: 'users#update'
  
  resources :nests, only: [:create, :show] do
    post 'join', on: :collection
    get 'requests', on: :member
    patch 'approve/:user_id', on: :member, to: 'nests#approve'
    post 'members', on: :member, to: 'nests#add_managed_member'
    resources :missions
    resources :calendar_events
    resources :goals
    resources :transactions
  end
  
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"
end
