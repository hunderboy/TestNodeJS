// Express 기본 모듈 불러오기
var express = require('express')
  , http = require('http')
  , path = require('path');
// Express의 미들웨어 불러오기
var bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , static = require('serve-static')
  , errorHandler = require('errorhandler');
// 에러 핸들러 모듈 사용
var expressErrorHandler = require('express-error-handler');


// 익스프레스 객체 생성
var app = express();
// 기본 속성 설정
app.set('port', process.env.PORT || 3000);
// body-parser를 이용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({ extended: false }))
// body-parser를 이용해 application/json 파싱
app.use(bodyParser.json())
// public 폴더를 static으로 오픈
app.use('/public', static(path.join(__dirname, 'public')));


//===== 데이터베이스 연결 =====//
// mysql DB를 사용할수 있는 mysql 모듈 호출하기
var mysql = require('mysql');
//===== MySQL 데이터베이스 연결 설정 =====//
var pool = mysql.createPool({
    connectionLimit : 64, 
    host     : '127.0.0.1',
    user     : 'root',
    password : 'EverEX2019~!AWS',
    database : 'everexdb',
    debug    :  false
});





var confirmConnection = function() {
    console.log('confirmConnection 커넥션 확인 함수 호출');
    pool.getConnection(function(err, conn) {
        // 커넥션 에러시
        if (err) {
        	if (conn) {
                conn.release();  // 반드시 해제해야 함 - 에러시 connection 객체를 반납한다는 의미
            }
            callback(err, null);
            return;
        }   
        // 커넥션 무사 통과
        console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);
        console.log('\n'); // 줄바꿈


        // 1. select 테스트
        // selectTEST(conn);

        // 2. insert 테스트
        // insert 할 데이터를 객체로 만듦
        // var id = "five"
        // var name = "조동현"
        // var age = 36
        // var password = "ASDFqwer1234!@"
        // var data = {id:id, name:name, age:age, password:password};
        // insertTEST(conn,data);

        // 3. update 테스트
        // UPDATE users SET name = '이성훈', WHERE id = 'four';
        // update 할 데이터를 객체로 만듦
        // var id = "four"
        // var namedata = "테스트2"
        // var data = {id:id, name:namedata};
        // updateTEST(conn,data);

        // 4. delete 테스트
        // var id = "four"
        // var namedata = "테스트2"
        // var num = 7
        // var data = {id:id, name:namedata, num:num};
        // deleteTEST(conn,data);




        conn.on('error', function(err) {      
            console.log('데이터베이스 연결 시 에러 발생함.');
            console.dir(err);
            
            callback(err, null);
        });
    });
}


// 1. select
var selectTEST = function(conn){
    var selectData = conn.query('select * from users', function(err, rows, fields) {
        conn.release();  // 쿼리 결과를 받는 함수 이기에, 반드시 해제해야 함
        console.log('실행된 SQL 확인: ' + selectData.sql);
        if (err) {
            console.log('SQL 실행 시 에러 발생함.');
            console.dir(err);
            
            callback(err, null);
            
            return;
        }

        var result = 'rows : ' + JSON.stringify(rows); // row = [{},{},{},{}] 형태의 JSON 데이터
        console.log('select 결과 : ' + result);
        // callback(null, result);
    });
}
// 2. insert
var insertTEST = function(conn,data){
    var exec = conn.query('insert into users set ?', data, function(err, result) {
        conn.release();  // 쿼리 결과를 받는 함수 이기에, 반드시 해제해야 함
        console.log('실행된 SQL 확인: ' + exec.sql);
        if (err) {
            console.log('SQL 실행 시 에러 발생함.');
            console.dir(err);
            
            callback(err, null);
            
            return;
        }
        
        console.log('insert 결과 : ' + result);
        // callback(null, result);
    });
}
// 3. update
// UPDATE users SET name = '이성훈', WHERE id = 'four';
var updateTEST = function(conn,data){

    var exec = conn.query('update users set updated_at=now() ,name=? where id=?', [data["name"], data["id"]], function(err, result) {
        conn.release();  // 쿼리 결과를 받는 함수 이기에, 반드시 해제해야 함
        console.log('실행된 SQL 확인: ' + exec.sql);
        if (err) {
            console.log('SQL 실행 시 에러 발생함.');
            console.dir(err);
            callback(err, null);
            return;
        }

        console.log('insert 결과 : ' + result);
        // callback(null, result);
    });
}
// 4. delete
var deleteTEST = function(conn,data){

    // DELETE FROM users WHERE id ='four';
    var exec = conn.query('delete from users where num=?', [data["num"]], function(err, result) {
        conn.release();  // 쿼리 결과를 받는 함수 이기에, 반드시 해제해야 함
        console.log('실행된 SQL 확인: ' + exec.sql);
        if (err) {
            console.log('SQL 실행 시 에러 발생함.');
            console.dir(err);
            callback(err, null);
            return;
        }

        console.log('delete 결과 : ' + result);
        // callback(null, result);
    });
}









// 404 에러 페이지 처리
var errorHandler = expressErrorHandler({
 static: {
   '404': './public/404.html'
 }
});

app.use( expressErrorHandler.httpError(404) );
app.use( errorHandler );


// Express 서버 시작
http.createServer(app).listen(app.get('port'), function(){
  console.log('서버가 시작되었습니다. 포트 : ' + app.get('port'));

//   confirmConnection();



});