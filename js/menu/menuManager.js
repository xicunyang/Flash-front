/**
 * 一个是`Vue.nextTick(callback)`，当数据发生变化，更新后执行回调。 数据完成后
 另一个是`Vue.$nextTick(callback)`，当dom发生变化，更新后执行的回调。 v-for结束后
 */

layui.use(['jquery', 'layer'], function () {
    var $ = layui.jquery,
        layer = layui.layer;

    var layerIndex_menu_detail_panel;
    var layerIndex_menu_add_panel;

    let vm = new Vue({
        el: "#menu",
        data: {
            menuListTea: [], // 请求 - 后台请求得到的教师menu信息列表
            menuListStu: [], // 请求 - 后台请求得到的学生menu信息列表
            identifier: null, // 菜单栏身份信息
            className: 'accordion',// 渲染 - class前缀
            idNameTea: 'teaItem', // 教师 - 渲染 - id前缀
            idNameStu: 'stuItem', // 学生 - 渲染 - id前缀
            detailMenuInfo: {}, // 详细 - 详细信息主体
            addMenuInfoParents: {}, // 添加 - 当时添加时的菜单的父级菜单信息
            addMenuInfo: {},  // 添加 - 当前添加时的子菜单主体
            addMenuIdentifier: null, // 添加 - 当前添加信息时候的用户身份
            hoverId: -1 // 渲染 - 鼠标mouseover的事件
        },
        mounted() {
            // 生命钩子 - 加载完毕所执行的方法
            //1. vue加载完毕  获取菜单栏参数
            this.getUrlIdentifier();
            //2. 获取学生所需菜单信息
            this.getMenuInfoToStu();
            //3. 获取教师所需菜单信息
            this.getMenuInfoToTea();
        },
        updated() {
            // 展开模态框
            // this.openCollapse();
        },
        computed: {
            // 计算属性
        },
        methods: {
            // 方法区
            // 获取地址栏参数
            getUrlIdentifier() {
                this.identifier = getUrlInfoString("identifier");
            },
            // 根据identifier获取后台参数 - 学生
            getMenuInfoToStu() {
                getMenuInfoToStuCall.call(this);
            },
            // 根据identifier获取后台参数 - 教师
            getMenuInfoToTea() {
                getMenuInfoToTeaCall.call(this);
            },
            // 展开折叠框 - 效果一般
            openCollapse() {
                // 得到所有的menu数据
                if (this.menuListTea) {
                    this.menuListTea.forEach((menu, index) => {
                        $("." + this.className + index).collapse('toggle');
                    })
                }
            },
            // 打开数据详情
            showItemDetail(menu) {
                showItemDetailCall.call(this, menu);
            },
            // 为菜单绑定拖动事件
            bindDropLinsener() {
                bindDropLinsenerCall.call(this);
            },
            // 为菜单进行排序
            sortMenuIndex(This, ids) {
                sortMenuIndexCall(This, ids);
            },
            // 添加子菜单点击事件
            addItemMenu(menu, identifier) {
                addItemMenuCall.call(this, identifier, menu);
            },
            // 添加子菜单事件
            addMenuClickSubmit() {
                // 校验入参
                if (this.addMenuInfo.menuName === ""
                    || this.addMenuInfo.menuName === undefined) {
                    layer.msg("菜单名称不能为空,请重新输入");
                    return;
                }
                if (this.addMenuInfo.menuIcon === ""
                    || this.addMenuInfo.menuIcon === undefined) {
                    layer.msg("菜单图标不能为空,请重新输入");
                    return;
                }

                addMenuClickSubmitCall.call(this);
            },
            delMenuClick(id) {
                // 根据id进行删除
                if (id === "" || id === undefined) {
                    layer.msg("删除有误,请稍后重试");
                    return;
                }
                delMenuClickCall.call(this, id);
            },
            // 保存按钮-保存修改
            saveBtnSubmit() {
                if (this.detailMenuInfo.menuName === "" || this.detailMenuInfo.menuName === undefined) {
                    layer.msg("菜单名称不能为空,请输入后重试");
                    return;
                }
                if (this.detailMenuInfo.menuIcon === "" || this.detailMenuInfo.menuIcon === undefined) {
                    layer.msg("菜单图标不能为空,请输入后重试");
                    return;
                }

                saveBtnSubmitCall.call(this);
            }
        }
    });

    function getMenuInfoToStuCall() {
        this.$http.get(url + "/menu/find-all-menu-by-identifier?identifier=1")
            .then(response => {
                var data = JSON.parse(response.body);
                if (data.success) {
                    this.menuListStu = data.data;

                    // 使用$nextTick防范 回调函数是当前v-for加载完成
                    this.$nextTick(function () {
                        // 为item绑定拖动事件
                        this.bindDropLinsener();
                    })
                } else {
                    layer.msg("服务器连接异常,请稍后重试");
                }
            }, response => {
                layer.msg("服务器连接异常,请稍后重试");
            });
    }

    function getMenuInfoToTeaCall() {
        this.$http.get(url + "/menu/find-all-menu-by-identifier?identifier=2")
            .then(response => {
                var data = JSON.parse(response.body);
                if (data.success) {
                    this.menuListTea = data.data;
                    console.log(this.menuListTea);

                    // 使用$nextTick防范 回调函数是当前v-for加载完成
                    this.$nextTick(function () {
                        // 为item绑定拖动事件
                        this.bindDropLinsener();
                    })

                } else {
                    layer.msg("服务器连接异常,请稍后重试");
                }
            }, response => {
                layer.msg("服务器连接异常,请稍后重试");
            });
    }

    function showItemDetailCall(menu) {
        // 更新单个菜单的值
        this.detailMenuInfo = menu;
        console.log(menu);
        if(menu.menuName === undefined){
            // 证明是父级菜单进行编辑查看
            // 重新将父级菜单的值赋到子级菜单上
            menu.menuName = menu.parentMenuName;
            menu.menuUrl = null;
            menu.menuIcon = menu.parentMenuIcon;
        }
        console.log(menu.menuName);
        // 打开编辑页面
        layerIndex_menu_detail_panel = layer.open({
            title: "菜单详情&编辑",
            type: 1,
            content: $(".menu-detail"),
            area: '500px',
            cancel: function (index, layero) {
                layer.close(index);
            }
        });
    }

    function bindDropLinsenerCall() {
        // 教师-为所有的item都绑定拖动事件
        let This = this;
        this.menuListTea.forEach((menu, index) => {
            var el = document.getElementById("teaItem" + index);

            //常用
            new Sortable(el,
                {
                    ghostClass: "sortable-ghost",
                    onEnd: function (evt) { // 拖拽结束
                        var itemEl = evt.item;

                        // 拖动结束 根据返回结果解析得到id
                        // 1.得到父控件
                        let lis = $(itemEl).parent().find("li");
                        let ids = [];
                        for (let i = 0; i < lis.length; i++) {
                            ids.push(lis[i].getAttribute("id"));
                        }

                        openLoading();

                        // 进行排序
                        This.sortMenuIndex(This, ids);
                    }
                });
        });
        // 教师-为大列表绑定拖动事件
        var elTea = document.getElementById("panelGroupTea");
        new Sortable(elTea,
            {
                onEnd: function (evt) { // 拖拽结束
                    var itemEl = evt.item;

                    // 1.得到父控件
                    let des = $(itemEl).parent().find(".panel-default");
                    let ids = [];
                    for (let i = 0; i < des.length; i++) {
                        ids.push(des[i].getAttribute("id"));
                    }

                    openLoading();

                    // 进行排序
                    This.sortMenuIndex(This, ids);
                }
            });
        // 学生- 为大列表当顶拖动事件
        var elStu = document.getElementById("panelGroupStu");
        new Sortable(elStu,
            {
                onEnd: function (/**Event*/evt) { // 拖拽结束
                    var itemEl = evt.item;
                }
            });
        // 学生 - 为子menu绑定拖动事件
        this.menuListStu.forEach((menu, index) => {
            var el = document.getElementById("stuItem" + index);

            //常用
            new Sortable(el,
                {
                    ghostClass: "sortable-ghost",
                    onEnd: function (evt) { // 拖拽结束
                        var itemEl = evt.item;

                        // 拖动结束 根据返回结果解析得到id
                        // 1.得到父控件
                        let lis = $(itemEl).parent().find("li");
                        let ids = [];
                        for (let i = 0; i < lis.length; i++) {
                            ids.push(lis[i].getAttribute("id"));
                        }

                        openLoading();

                        // 进行排序
                        This.sortMenuIndex(This, ids);
                    }
                });
        });
    }

    function sortMenuIndexCall(This, ids) {
        This.$http({
            method: "post",
            body: JSON.stringify(ids),
            url: url + "/menu/sort-item-menu-by-ids",
            emulateJSON: true,
        }).then(response => {
            closeLoading();
            let data = JSON.parse(response.body);
            if (data.success) {
                layer.msg("排序状态更新成功");
                // 刷新数据  以更新页面
                // this.getMenuInfoToTea();
            } else {
                layer.msg("排序状态更新失败，请稍后重试");
            }
        }, response => {
            closeLoading();
            layer.msg("排序状态更新失败，请稍后重试");
        });
    }

    function addItemMenuCall(identifier, menu) {
        this.addMenuIdentifier = identifier;
        this.addMenuInfoParents = menu;

        console.log(menu);
        // 清空原来的值
        this.addMenuInfo = {};
        // 打开编辑页面
        layerIndex_menu_add_panel = layer.open({
            title: "添加子菜单",
            type: 1,
            content: $(".menu-add"),
            area: '500px',
            cancel: function (index, layero) {
                layer.close(index);
            }
        });
    }

    function addMenuClickSubmitCall() {
        // 成功  就请求后台数据
        if(this.addMenuInfoParents === null){
            this.addMenuInfoParents = {id:-1}
        }
        // 组装参数
        let data = {
            pid: this.addMenuInfoParents.id,
            menuName: this.addMenuInfo.menuName,
            menuUrl: this.addMenuInfo.menuUrl,
            menuIcon: this.addMenuInfo.menuIcon,
            identifier: this.addMenuIdentifier
        };

        openLoading();
        this.$http({
            method: "post",
            body: JSON.stringify(data),
            url: url + "/menu/insert-menu-item",
            emulateJSON: true,
        }).then(response => {
            closeLoading();
            let data = JSON.parse(response.body);
            if (data.success) {
                layer.msg(data.msg);
                if (data.innerSuccess) {
                    layer.close(layerIndex_menu_add_panel);
                    // 刷新数据  以更新页面
                    if(this.addMenuIdentifier === 1){
                        this.getMenuInfoToStu();
                    }else{
                        this.getMenuInfoToTea();
                    }
                }
            } else {
                layer.msg("添加菜单信息失败，请稍后重试");
            }
        }, response => {
            closeLoading();
            layer.msg("添加菜单信息失败，请稍后重试");
        });
    }

    function delMenuClickCall(id) {
        var This = this;
        layer.open({
            content: '是否删除该菜单?'
            , btn: ['确定', '取消']
            , yes: function (index, layero) {
                openLoading();
                This.$http.get(url + "/menu/delete-menu-item-by-id?id=" + id)
                    .then(response => {
                        var data = JSON.parse(response.body);
                        if (data.success) {
                            layer.msg(data.msg);
                            // 刷新数据  以更新页面
                            This.getMenuInfoToTea();
                            // 刷新数据  以更新页面
                            This.getMenuInfoToStu();
                            // 关闭该提示框
                            layer.close(index);
                        } else {
                            layer.msg("服务器连接异常,请稍后重试");
                        }
                        closeLoading();
                    }, response => {
                        layer.msg("服务器连接异常,请稍后重试");
                        closeLoading();
                    });

            }
        });
    }

    function saveBtnSubmitCall() {
        // 成功  就请求后台数据
        // 组装参数
        let data = {
            id: this.detailMenuInfo.id,
            menuName: this.detailMenuInfo.menuName,
            menuUrl: this.detailMenuInfo.menuUrl,
            menuIcon: this.detailMenuInfo.menuIcon,
        };

        openLoading();
        this.$http({
            method: "post",
            body: JSON.stringify(data),
            url: url + "/menu/update-menu-item-by-id",
            emulateJSON: true,
        }).then(response => {
            closeLoading();
            let data = JSON.parse(response.body);
            if (data.success) {
                layer.msg(data.msg);
                if (data.innerSuccess) {
                    layer.close(layerIndex_menu_detail_panel);
                    // 刷新数据  以更新页面
                    this.getMenuInfoToTea();
                    this.getMenuInfoToStu();
                }
            } else {
                layer.msg("更新菜单信息失败，请稍后重试");
            }
        }, response => {
            closeLoading();
            layer.msg("更新菜单信息失败，请稍后重试");
        });
    }

});


// 获取地址栏参数
function getUrlInfoString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}
