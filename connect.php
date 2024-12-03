<?php 

    define('PG_DB', "web"); //cần thay define('PG_DB', "Tên Database của các bạn muốn kết nối trong pgAdmin 4")
    define('PG_HOST', "localhost"); //cần thay
    define('PG_USER', "postgres"); //cần thay define('PG_USER', "Tên đăng nhập vào pgAdmin 4 -> thường mặt định là postgres ")
    define('PG_PORT', "5432"); // cần thay
    define('PG_PASS', "postgres"); // cần thay define('PG_PASS', "mật khẩu đăng nhập pgAdmin 4 của bạn")

    #extension = pgsql
    #bat config trong apache php.ini

    $conn = pg_connect("dbname=".PG_DB." password=".PG_PASS." host=".PG_HOST." user=".PG_USER." port=".PG_PORT);
?>