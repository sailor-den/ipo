$(document).ready(function($) {
	$('.catalog__menu .menu__item').click(function(e) {
		e.preventDefault();

        category = $(this).data('group'),
        prevCategory = $('.catalog__menu .menu__item.menu__item_active'),
        prevCategoryId = $('.catalog__menu .menu__item.menu__item_active').data('group');

		prevCategory.removeClass('menu__item_active');
		$('.catalog__menu .menu__item[data-group='+category+']').addClass('menu__item_active');
		$('#group_'+prevCategoryId).css('display', 'none');
		$('#group_'+category).css('display', 'flex');
	});
});