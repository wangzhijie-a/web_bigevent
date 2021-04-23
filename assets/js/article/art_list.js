$(function() {
    var layer = layui.layer;
    var form = layui.form;
    var laypage = layui.laypage;

    //定义一个美化时间的过滤器
    template.defaults.imports.dataFormat = function(date) {
        const dt = new Date(date);
        var y = dt.getFullYear();
        var m = padZero(dt.getMonth() + 1);
        var d = padZero(dt.getDate());

        var hh = padZero(dt.getHours());
        var mm = padZero(dt.getMinutes());
        var ss = padZero(dt.getSeconds());

        return y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ':' + ss
    }

    //定义补零的函数
    function padZero(n) {
        return n > 9 ? n : '0' + n;
    }

    //定义一个查询的参数对象,将来请求数据的时候
    //需要将请求参数对象提交到服务器
    var q = {
        pagenum: 1, //	页码值
        pagesize: 2, //每页显示多少条数据
        cate_id: '', //	文章分类的 Id
        state: '' //文章的状态，可选值有：已发布、草稿
    }

    initTable();
    initCate();
    //获取文章列表数据的方法
    function initTable() {
        $.ajax({
            method: 'GET',
            url: '/my/article/list',
            data: q,
            success: function(res) {
                if (res.status !== 0) {
                    return layer.msg('获取列表失败')
                }
                //使用模板引擎渲染页面
                var htmlStr = template('tpl-table', res)
                $('tbody').html(htmlStr);
                //调用渲染分页的方法
                renderPage(res.total);
            }
        })
    }

    //初始化文章分类的方法
    function initCate() {
        $.ajax({
            method: 'GET',
            url: '/my/article/cates',
            success: function(res) {
                if (res.status !== 0) {
                    return layer.msg('获取分类数据失败');
                }
                //调用模板引擎渲染数据
                var htmlStr = template('tpl-cate', res);
                $('[name=cate_id]').html(htmlStr);
                //通知layui重新渲染ui结构
                form.render();
            }
        })
    }

    //为筛选表单绑定submit事件
    $('#form-search').on('submit', function(e) {
        e.preventDefault();
        //获取表单中选中项的值
        var cate_id = $('[name=cate_id]').val();
        var state = $('[name=state]').val();
        //为q赋值
        q.cate_id = cate_id;
        q.state = state;
        //根据最新的筛选条件，重新渲染表格的数据
        initTable();
    })

    //定义渲染分页的方法
    function renderPage(total) {
        //渲染分页
        laypage.render({
            elem: 'pageBox', //注意，这里的 test1 是 ID，不用加 # 号
            count: total, //数据总数，从服务端得到
            limit: q.pagesize, //每页多少条
            curr: q.pagenum, //设置默认页
            layout: ['count', 'limit', 'prev', 'page', 'next', 'skip'],
            limits: [2, 3, 5, 10],
            //分页发生切换的时候，触发jump回调
            //触发jump回调的方式有两种
            //1、点击页码
            //2、调用laypage.render()方法
            //通过first判断，如果为true，就是方式二触发的
            jump: function(obj, first) {
                //把最新的页码值赋值到q对象中
                q.pagenum = obj.curr;
                q.pagenum = obj.limit;
                //根据最新的q获取对应的数据列表，并渲染表格
                if (!first) {
                    initTable();
                }
            }
        });
    }

    //通过代理的方式为删除按钮绑定点击事件
    $('tbody').on('click', '.btn-delete', function() {
        var len = $('.btn-delete').length;
        var id = $(this).attr('data-id');
        layer.confirm('确认删除?', { icon: 3, title: '提示' }, function(index) {
            $.ajax({
                method: 'GET',
                url: '/my/article/delete/' + id,
                success: function(res) {
                    if (res.status !== 0) {
                        layer.msg('删除失败')
                    }
                    layer.msg('删除成功')
                    if (len === 1) {
                        q.pagenum = q.pagenum === 1 ? 1 : q.pagenum - 1;
                    }
                    initTable();
                }
            })

            layer.close(index);
        });
    })
})