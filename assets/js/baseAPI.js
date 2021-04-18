//每次调用$.get $.post $.ajax 请求时
//会先调用这个函数
//在这个函数中，可以拿到我们给ajax提供的配置对象
$.ajaxPrefilter(function(options) {
    console.log(options.url);
    options.url = 'http://api-breakingnews-web.itheima.net' + options.url
})