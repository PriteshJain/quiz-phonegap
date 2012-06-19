
/*
 @author Pritesh Jain
 @access public
 Sql Class Middle layer
 */

var quizy = [];
var db;
var dbCreated = false;


window.localStorage.setItem('currentQuestion',-1);
window.localStorage.setItem('selectedAnswer',-1);

function sql()
{
    var dbobj = getDatabase();
    //Local Database Object
    this.databaseobj = dbobj;

    //check rows
    dbobj.transaction(checkRows,databaseNotSetup);
}

//function onDeviceReady()
function getDatabase()
{

    try{
        if(!window.openDatabase)
        {
            alert('Not supported -> Please try with try kit browser');
        }
        else
        {
            var shortname = 'QuizDB';
            var version = '1.0';
            var displayname = 'Quiz Demo';
            var maxsize = '200000';
            db = window.openDatabase(shortname,version,displayname,maxsize);
            return db;
        }
    }
    catch(e){
        if (e == 2) {
            alert("Invalid database version.");
        } else {
            alert("Unknown error "+e+".");
        }return;
    }
}



function checkRows(tx)
{
    var sql = "select count(*) as countall from QuizDB";
    tx.executeSql(sql, [], getCount_success);
}


function getCount_success(tx, results)
{
    $('.busy').hide();

    var questionCount = results.rows.item(0);

    if(questionCount.countall){
        //this.databaseobj.transaction(getCars, transaction_error);
        this.databaseobj.transaction(getMakeList, transaction_error);
    }
    else
    {
        readJsonFile();
    }
}

function databaseNotSetup(tx, error) {
    $('#busy').hide();
    readJsonFile();
}


function readJsonFile() {
    $.ajax({
        url: "json/quiz.json",
        dataType: "json",
        success: function(json) {
            $(json.questions).each(function(){
                var questions_json = new Object();
                questions_json = this;
                quizy.push(questions_json);
            });
            db.transaction(populateDB, transaction_error, populateDB_success);
        }
    });
}



function populateDB(tx) {
    populateQuizTable(tx);
    populateResultsTable(tx);

}


function populateQuizTable(tx) {
    tx.executeSql('DROP TABLE IF EXISTS QuizTable');

    var sql =
        "CREATE TABLE IF NOT EXISTS QuizTable ( " +
            "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
            "question VARCHAR(500), " +
            "answers VARCHAR(1000), " +
            "correct_answer INTEGER)";
    tx.executeSql(sql);


    var questions ;
    total_questions = quizy.length
    for (var i=0; i < quizy.length; i++)
    {
        var myquestion = new Object();
        myquestion = quizy[i];
        var query = "INSERT INTO QuizTable (id, question, answers, correct_answer) VALUES ('" +
            i + "', '" +
            myquestion.question + "', '" +
            myquestion.answers + "','" +
            myquestion.correctAnswer + "')";
        tx.executeSql(query);
    }

}

function populateResultsTable(tx) {
    tx.executeSql('DROP TABLE IF EXISTS QuizResultTable');

    var sql =
        "CREATE TABLE IF NOT EXISTS QuizResultTable ( " +
            "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
            "question_no INTEGER, " +
            "selected_answer INTEGER )";
    tx.executeSql(sql);

    for (var i=0; i < quizy.length; i++)
    {
        var query = "INSERT INTO QuizResultTable (id, question_no, selected_answer) VALUES ('" +
            i + "','" + i + "','" + "-1" +  "')";
        tx.executeSql(query);
    }

}


function isNumber(o) {
    return !isNaN(o-0);
}

function transaction_error(tx, error) {
    $('#busy').hide();
    alert("transaction_error" + tx.message);
}

function populateDB_success() {
    dbCreated = true;
}


function getQuestions(tx)
{
    var sql = "select * from QuizTable"; 
    tx.executeSql(sql, [], getQuestions_success);
}

function getQuestions_success(tx,results)
{
    var len = results.rows.length;

    for(var question_no=1;question_no<=len; question_no++)
    {
        var quest = results.rows.item(question_no-1);
        answers =quest.answers.split(",");
        var quest_div = "" +
            '<div data-role="page" data-dom-cache="true" id="quest' + question_no + '">' +
            '<div data-role="header">'+
            '<h1> Java Quiz</h1> ' +
            '</div>' +
            '<div data-role="content">' +
            '<p>' +  question_no  +  ". " +  quest.question + '</p>' +
            '<ul data-role="listview" class="answers" id="quest' + question_no + '-list" question-no='  + question_no +'>';
        for(var i=0;i<answers.length;i++)
        {
            quest_div =  quest_div  + '<li  data-question-no="'+ question_no  + '" data-answer-no="' +  (i+1) + '" >' + answers[i] + '</li>';
        }
        quest_div = quest_div +
            '</ul><p><br/></p>';

        quest_div = quest_div + "" +
            '<a href="#"  data-transition="slidedown" data-icon="arrow-r"  data-iconpos="right" data-question-no="'+question_no  +'" class="small-button" data-theme="c" data-role="button">' +
            'Next</a>' +

            '<span id="error-display-' +  question_no + '"></span>' +
            '</div> ' +
            '</div>';
        $("body").append(quest_div);
    }

}

function checkResults(tx) {
        var query = "select count(*) as count from QuizResultTable where selected_answer = 1";
        var res  = tx.executeSql(query,[], checkResultsSuccess);    
}

function checkResultsSuccess(tx,results) {
    var result = results.rows.item(0).count
    $('#result-answers').text(" " + result + " / " + total_questions);
}

 


function updateSelectedAnswer(tx) {
        var q_no = window.localStorage.getItem("currentQuestion");
        var query = "select correct_answer from Quiztable where id = " + (q_no);
        var res  = tx.executeSql(query,[], updateSelectedAnswerSuccess);    
}


function updateSelectedAnswerSuccess(tx,results)  {
    var selected_answer = window.localStorage.getItem("selectedAnswer");
    var q_no = window.localStorage.getItem("currentQuestion");
    if (results.rows.length > 0 ) {
        var correct_answer = results.rows.item(0).correct_answer;
        var query = "";
        if (correct_answer == selected_answer) {
            query = "UPDATE QuizResultTable set selected_answer = 1 where question_no=" + q_no ;
        }
        else {
            query = "UPDATE QuizResultTable set selected_answer = 0 where question_no=" + q_no ;
        }
        tx.executeSql(query);        
    }
}
