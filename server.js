//引入模块
var http = require("http")
var qs = require("querystring")
var oUrl = require("url")
var fs = require("fs")
var mysql = require("mysql");
//创建模块
server = http.createServer(function (req, res) {
    var url = req.url;
    if (url == "/favicon.ico") return;
    //判断是接口还是读取;
    var str = ""
    req.on("data", function (data) {
        str += data;
    })
    req.on("end", function (data) {
        //先是get模式;
        var urlObj = oUrl.parse(url, true)
        url = urlObj.pathname;
        var GET = urlObj.query;
        var POST = qs.parse(str)
        var params = req.method == "GET" ? GET : POST;
        //读取
        if (url == "/login") {//登录模块,创建数据库连接;
            var connection = mysql.createConnection({
                host: "localhost",
                user: "root",
                password: "",
                database: "my_userdata"
            })
            var username = params.username;
            var password = params.password;
            var sql = `select * from my_userdata.userdata where username="${username}" and password="${password}"`
            connection.query(sql, function (err, data) {
                if (err) {
                    res.end(`服务繁忙`)
                } else {
                    //判断用户名是否存在;
                    if (data.length == 0) {
                        res.end(`{status:0,msg:用户名或密码错误}`)
                    } else {
                        res.end(`{status:1,msg:登录成功}`)
                    }
                }
            })
        } else if (url == "/reg") {
            //创建数据库服务;
            var connection = mysql.createConnection({
                host: "localhost",
                user: "root",
                password: "",
                database: "my_userdata"
            })
            var username = params.username;
            var password = params.password;
            var sql = `select * from my_userdata.userdata where username="${username}"`
            var insertsql = `INSERT INTO my_userdata.userdata(username,PASSWORD) VALUES("${username}","${password}")`
            //验证用户名是否存在
            connection.query(sql, function (err, data) {
                if (err) {
                    res.end(`服务繁忙1`)
                } else {
                    if (data.length == 0) {//判断是否用户名存在;
                        connection.query(insertsql, function (err, data) {//执行插入;
                            if (err) {
                                res.end(`服务繁忙2`)
                            } else {
                                //data.affectedRows==1表示插入成功;
                                if (data.affectedRows == 1) {
                                    res.end(`{status:1,msg:注册成功}`)
                                } else {
                                    res.end(`服务繁忙3`)
                                }
                            }
                        })

                    } else {
                        res.end(`{status:0,msg:用户名已存在}`)
                    }
                }
            })
        } else {//读取文件;
            fs.readFile("www" + url, function (err, data) {
                if (err) {
                    res.end("404!")
                } else {
                    res.end(data)
                }
            })
        }
    })
})
//监听模块
server.listen(9000);