# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_01_14_110258) do
  create_table "calendar_events", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "creator_id"
    t.date "date"
    t.date "end_date"
    t.string "event_type"
    t.string "image_url"
    t.integer "nest_id", null: false
    t.string "title"
    t.datetime "updated_at", null: false
    t.index ["nest_id"], name: "index_calendar_events_on_nest_id"
  end

  create_table "goals", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "current"
    t.string "goal_type"
    t.integer "nest_id", null: false
    t.integer "target"
    t.string "title"
    t.string "unit"
    t.datetime "updated_at", null: false
    t.index ["nest_id"], name: "index_goals_on_nest_id"
  end

  create_table "missions", force: :cascade do |t|
    t.integer "assigned_to"
    t.datetime "created_at", null: false
    t.string "image_url"
    t.boolean "is_completed"
    t.integer "nest_id", null: false
    t.string "repeat"
    t.string "title"
    t.datetime "updated_at", null: false
    t.index ["nest_id"], name: "index_missions_on_nest_id"
  end

  create_table "nests", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "invite_code"
    t.string "name"
    t.integer "theme_id"
    t.datetime "updated_at", null: false
  end

  create_table "transactions", force: :cascade do |t|
    t.decimal "amount"
    t.string "category"
    t.datetime "created_at", null: false
    t.date "date"
    t.integer "nest_id", null: false
    t.integer "payer_id"
    t.string "title"
    t.datetime "updated_at", null: false
    t.index ["nest_id"], name: "index_transactions_on_nest_id"
  end

  create_table "users", force: :cascade do |t|
    t.integer "avatar_id"
    t.datetime "created_at", null: false
    t.string "email"
    t.string "member_type"
    t.integer "nest_id"
    t.string "nest_status", default: "active"
    t.string "nickname"
    t.string "password_digest"
    t.datetime "updated_at", null: false
  end

  add_foreign_key "calendar_events", "nests"
  add_foreign_key "goals", "nests"
  add_foreign_key "missions", "nests"
  add_foreign_key "transactions", "nests"
end
