$(function() {
    var layer = layui.layer;
    var form = layui.form;
    initcate();
    // 初始化富文本编辑器
    initEditor()

    function initcate() {
        $.ajax({
            method: 'GET',
            url: '/my/article/cates',
            success: function(res) {
                if (res.status !== 0) {
                    return layer.msg('获取失败')
                }
                //调用模板引擎
                var htmlStr = template('tpl-cate', res);
                $('[name=cate_id]').html(htmlStr);
                form.render();
            }
        })
    }

    // 1. 初始化图片裁剪器
    var $image = $('#image')

    // 2. 裁剪选项
    var options = {
        aspectRatio: 400 / 280,
        preview: '.img-preview'
    }

    // 3. 初始化裁剪区域
    $image.cropper(options)

    $('#btnChooseImage').on('click', function() {
        $('#coverFile').click();
    })

    //监听coverFile的change事件
    $('#coverFile').on('change', function(e) {
        var files = e.target.files;
        if (files.length <= 0) {
            return
        }
        var newImgURL = URL.createObjectURL(files[0])
        $image
            .cropper('destroy') // 销毁旧的裁剪区域
            .attr('src', newImgURL) // 重新设置图片路径
            .cropper(options) // 重新初始化裁剪区域
    })

    //定义文章发布状态
    var art_state = '已发布';
    $('#btnSave2').on('click', function() {
        art_state = '草稿';
    })

    //监听form表单的submit事件
    $('#form-pub').on('submit', function(e) {
        e.preventDefault();
        //基于form快速创建一个FromDate对象
        var fd = new FormData($(this)[0]);
        //将文章的发布状态存到fd中
        fd.append('state', art_state);
        // fd.forEach(function(v, k) {
        //     console.log(k, v);
        // })
        //将裁剪后的图片，输出为文件
        $image
            .cropper('getCroppedCanvas', { // 创建一个 Canvas 画布
                width: 400,
                height: 280
            })
            .toBlob(function(blob) { // 将 Canvas 画布上的内容，转化为文件对象
                // 得到文件对象后，进行后续的操作
                fd.append('cover_img', blob)
                    //发布文章的函数
                publishArticle(fd);
            })
    })

    //定义一个发布文章的方法
    function publishArticle(fd) {
        $.ajax({
            method: 'POST',
            url: '/my/article/add',
            data: fd,
            //注意，向服务器提交FormData格式的数据
            //需要加以下两个参数
            contentType: false,
            processData: false,
            success: function(res) {
                if (res.status !== 0) {
                    return layer.msg('发布失败')
                }
                layer.msg('发布成功')
                location.href = '/article/art_list.html'
            }
        })
    }
})