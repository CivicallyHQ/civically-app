WIDGET_ATTRIBUTES = [
  :position,
  :order
]

DATA_ATTRIBUTES = [
  :enabled,
  widget: WIDGET_ATTRIBUTES
]

class CivicallyApp::AppController < ::ApplicationController
  before_action :ensure_logged_in, only: [:place, :user, :add, :remove, :update]
  before_action :find_user, only: [:add, :remove, :update]

  attr_accessor :user

  def index
    render nothing: true
  end

  def general
    render_serialized(CivicallyApp::App.general_apps, CivicallyApp::AppSerializer)
  end

  def place
    render_serialized(CivicallyApp::App.place_apps(current_user), CivicallyApp::AppSerializer)
  end

  def user
    render_serialized(CivicallyApp::App.user_apps(current_user), CivicallyApp::AppSerializer)
  end

  def details
    params.require(:name)
    app = CivicallyApp::App.all_apps.select { |a| params[:name] == a.name }
    render_serialized(app[0], CivicallyApp::AppSerializer, root: false)
  end

  def add
    result = CivicallyApp::App.add(@user, app_params[:name], app_data)
    app_responder(result)
  end

  def remove
    result = CivicallyApp::App.remove(@user, app_params[:name])
    app_responder(result)
  end

  def update
    result = CivicallyApp::App.update(@user, app_params[:name], app_data)
    app_responder(result)
  end

  def batch_update
    result = CivicallyApp::App.batch_update(@user, batch_params)
    app_responder(result)
  end

  def app_responder(result)
    if result[:success]
      render json: success_json.merge(result)
    elsif result[:error]
      render_json_error(result[:reason])
    else
      render_json_error(I18n.t('app.error.default'))
    end
  end

  def find_user
    params.require(:user_id)
    @user = User.find(params[:user_id])
    raise Discourse::NotFound if @user.nil?
  end

  def app_params
    permitted_params = DATA_ATTRIBUTES + [:name]
    params.require(:app).permit(permitted_params)
  end

  def app_data
    app_hash = app_params.to_h
    app_hash.select { |k, v|
      if k.to_sym == :widget
        app_hash[:widget].all? do |k, v|
          WIDGET_ATTRIBUTES.include?(k.to_sym)
        end
      else
        DATA_ATTRIBUTES.include?(k.to_sym)
      end
    }
  end

  def batch_params
    permitted_params = DATA_ATTRIBUTES + [:name]
    params.require(:apps).permit(permitted_params)
  end
end
