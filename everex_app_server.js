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


//===== 데이터베이스 연결 =====//
// mysql DB를 사용할수 있는 mysql 모듈 호출하기
var mysql = require('mysql');
//===== MySQL 데이터베이스 연결 설정 =====//
var pool = mysql.createPool({
    connectionLimit : 64, 
    host     : 'localhost',
    user     : 'root',
    password : 'EverEX2019~!AWS',
    database : 'everexdb',
    debug    :  false
});


// 익스프레스 객체 생성
var app = express();
// 설정 파일에 들어있는 port 정보 사용하여 포트 설정
app.set('port', process.env.PORT || 3000);
// body-parser를 이용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({ extended: false }))
// body-parser를 이용해 application/json 파싱
app.use(bodyParser.json())
// public 폴더를 static으로 오픈
app.use('/public', static(path.join(__dirname, 'public')));









//--------------------------------------------------------------------------------------
//===== 라우팅 함수 등록 =====//
// 라우터 객체 참조
var router = express.Router();


// 사용자 추가 라우팅 함수
router.route('/process/adduser').post(function(req, res) {
	console.log('/process/adduser 호출됨.');

    var paramName = req.body.name || req.query.name;
    var paramEmail = req.body.email || req.query.id;
    var paramPassword = req.body.password || req.query.password;
    
    console.log('요청 파라미터 : ' + paramName + ', ' + paramEmail + ', ' + paramPassword  );
    
    

    var name = String(paramName);
    // pool 객체가 초기화된 경우, addUser 함수 호출하여 사용자 추가
	if (pool) {
		addUser(paramName, paramEmail, paramPassword, function(err, addedUser) {
			// 동일한 id로 추가하려는 경우 에러 발생 - 클라이언트로 에러 전송
			if (err) {
                console.error('사용자 추가 중 에러 발생 : ' + err.stack);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>사용자 추가 중 에러 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
				res.end();
                
                return;
            }
			
            // 결과 객체 있으면 성공 응답 전송
			if (addedUser) {
				console.dir(addedUser);
	        	
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>사용자 추가 성공</h2>');
				res.end();
			} else {
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>사용자 추가 실패</h2>');
				res.end();
			}
		});
	} else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.end();
	}
	
});


// 라우터 객체 등록
app.use('/', router);
//--------------------------------------------------------------------------------------










//--------------------------------------------------------------------------------------
//사용자를 등록하는 함수
var addUser = function(name, email, password, callback) {
	console.log('addUser 호출됨 : ' + name + ', ' + email + ', ' + password);
	
	// 커넥션 풀에서 연결 객체를 가져옴
	pool.getConnection(function(err, conn) {
        if (err) {
        	if (conn) {
                conn.release();  // 반드시 해제해야 함 - 에러시 connection 객체를 반납한다는 의미
            }
            
            callback(err, null);
            return;
        }   
        console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);

    	// 데이터를 객체로 만듦 {컬럼명:데이터}
    	var data = {name:name, email:email, password:password};
    	
        // SQL 문을 실행함
        var exec = conn.query('insert into test set ?', data, function(err, result) {
        	conn.release();  // 반드시 해제해야 함
        	console.log('실행된 SQL : ' + exec.sql);
        	
        	if (err) {
        		console.log('SQL 실행 시 에러 발생함.');
        		console.dir(err);
        		
        		callback(err, null);
        		
        		return;
        	}
        	
        	callback(null, result);
        	
        });
        
        conn.on('error', function(err) {      
              console.log('데이터베이스 연결 시 에러 발생함.');
              console.dir(err);
              
              callback(err, null);
        });
    });	
}

//--------------------------------------------------------------------------------------









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



        // 2. insert 테스트
        // insert 할 데이터를 객체로 만듦
        // var id = "five"
        // var name = "조동현"
        // var age = 36
        // var password = "ASDFqwer1234!@"
        // var data = {id:id, name:name, age:age, password:password};
        // insertTEST(conn,data);


        conn.on('error', function(err) {      
            console.log('데이터베이스 연결 시 에러 발생함.');
            console.dir(err);
            
            callback(err, null);
        });
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