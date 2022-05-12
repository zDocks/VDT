<?php      
    $host = "15.204.149.143";  
    $user = "vdtdb";  
    $password = '1J*G-4bzWJIa)eIz';  
    $db_name = "vdtdb";  
      
    $con = mysqli_connect($host, $user, $password, $db_name);  
    if(mysqli_connect_errno()) {  
        die("Failed to connect with MySQL: ". mysqli_connect_error());  
    }  
?>  