from django.contrib import admin
from .models import Category, Product, Cart, CartItem, Order, OrderItem
from django.utils.html import format_html

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'display_image')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)
    
    def display_image(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="50" height="50" />', obj.image.url)
        return "Немає зображення"
    display_image.short_description = 'Зображення'

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'discount', 'display_discounted_price', 'available', 'display_image', 'created')
    list_filter = ('available', 'created', 'category')
    list_editable = ('price', 'discount', 'available')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name', 'description')
    date_hierarchy = 'created'
    ordering = ('-created',)
    filter_horizontal = ()
    fieldsets = (
        ('Основна інформація', {
            'fields': ('category', 'name', 'slug', 'description')
        }),
        ('Ціна та наявність', {
            'fields': ('price', 'discount', 'available')
        }),
        ('Зображення', {
            'fields': ('image',)
        }),
    )
    
    def display_image(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="50" height="50" />', obj.image.url)
        return "Немає зображення"
    display_image.short_description = 'Зображення'
    
    def display_discounted_price(self, obj):
        if obj.discount:
            return format_html(
                '<span style="text-decoration: line-through;">{}</span> <span style="color: red;">{} грн</span>',
                obj.price,
                obj.get_discounted_price()
            )
        return f"{obj.price} грн"
    display_discounted_price.short_description = 'Ціна зі знижкою'

class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at', 'updated_at', 'get_total_items', 'get_total_price')
    inlines = [CartItemInline]
    
    def get_total_items(self, obj):
        return obj.get_total_items()
    get_total_items.short_description = 'Кількість товарів'
    
    def get_total_price(self, obj):
        return f"{obj.get_total_price()} грн"
    get_total_price.short_description = 'Загальна сума'

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'created', 'status', 'get_total_price')
    list_filter = ('status', 'created')
    search_fields = ('user__username', 'id')
    inlines = [OrderItemInline]
    
    def get_total_price(self, obj):
        return f"{obj.get_total_price()} грн"
    get_total_price.short_description = 'Загальна сума'
