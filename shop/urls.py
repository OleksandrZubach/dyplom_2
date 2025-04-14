from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

app_name = 'shop'

urlpatterns = [
    path('', views.main_page, name='main_page'),
    path('products/', views.product_list, name='product_list'),
    path('categories/', views.category_list, name='category_list'),
    path('category/<slug:category_slug>/', views.product_list, name='product_list_by_category'),
    path('product/<int:product_id>/', views.product_detail, name='product_detail'),
    path('cart/', views.cart_detail, name='cart_detail'),
    path('cart/add/<int:product_id>/', views.cart_add, name='cart_add'),
    path('cart/remove/<int:product_id>/', views.cart_remove, name='cart_remove'),
    path('cart/count/', views.cart_count, name='cart_count'),
    path('products/<int:product_id>/quick-view/', views.quick_view, name='quick_view'),
    # Auth URLs
    path('login/', views.login_view, name='login_view'),
    path('logout/', views.logout_view, name='logout_view'),
    path('register/', views.register, name='register'),
    path('profile/', views.profile, name='profile'),
    path('blog/', views.blog_list, name='blog_list'),
    path('blog/<slug:slug>/', views.blog_detail, name='blog_detail'),
    path('order/create/', views.order_create, name='order_create'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) 