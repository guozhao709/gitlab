# frozen_string_literal: true

module Sidebars
  module Projects
    module Menus
      class DeploymentsMenu < ::Sidebars::Menu
        override :configure_menu_items
        def configure_menu_items
          # 不添加任何子项，使其成为纯一级链接
          true
        end

        override :render?
        def render?
          # 覆盖父类，即使没有子项也渲染菜单
          can?(context.current_user, :read_release, context.project)
        end

        override :link
        def link
          project_releases_path(context.project)
        end

        override :all_active_routes
        def all_active_routes
          { controller: :releases }
        end

        override :extra_container_html_options
        def extra_container_html_options
          {
            class: 'shortcuts-deployments-releases'
          }
        end

        override :title
        def title
          _('Releases')
        end

        override :sprite_icon
        def sprite_icon
          'rocket'
        end

        private

        def feature_flags_menu_item
          unless can?(context.current_user, :read_feature_flag, context.project)
            return ::Sidebars::NilMenuItem.new(item_id: :feature_flags)
          end

          ::Sidebars::MenuItem.new(
            title: _('Feature Flags'),
            link: project_feature_flags_path(context.project),
            active_routes: { controller: :feature_flags },
            container_html_options: { class: 'shortcuts-feature-flags' },
            item_id: :feature_flags
          )
        end

        def environments_menu_item
          unless can?(context.current_user, :read_environment, context.project)
            return ::Sidebars::NilMenuItem.new(item_id: :environments)
          end

          ::Sidebars::MenuItem.new(
            title: _('Environments'),
            link: project_environments_path(context.project),
            active_routes: { controller: :environments },
            container_html_options: { class: 'shortcuts-environments' },
            item_id: :environments
          )
        end

        def releases_menu_item
          if !can?(context.current_user, :read_release, context.project) ||
            context.project.empty_repo?
            return ::Sidebars::NilMenuItem.new(item_id: :releases)
          end

          ::Sidebars::MenuItem.new(
            title: _('Releases'),
            link: project_releases_path(context.project),
            item_id: :releases,
            active_routes: { controller: :releases },
            container_html_options: { class: 'shortcuts-deployments-releases' }
          )
        end
      end
    end
  end
end
