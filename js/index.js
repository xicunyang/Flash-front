// 使用VUE为主题构建项目
layui.use(['jquery','layer'], function(){
    var $ = layui.jquery,
        layer=layui.layer;

    let vm = new Vue({
        el:"#left-menu",
        data:{
            menuList:[]
        },
        mounted(){
            // 生命钩子 - 加载完毕所执行的方法
            this.initLeftMenu();
        },
        methods:{
            initLeftMenu(){
                this.$http.get('json/menu.json').then(response=>{
                    // 成功
                    response.body = JSON.parse(response.body);
                    this.menuList = response.body;
                    console.log(response.body);
                },response=>{
                    // 失败

                });
            }
        }
    });
});
