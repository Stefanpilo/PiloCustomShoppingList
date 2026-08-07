<?php
    ini_set('display_errors', 0);
    ini_set('log_errors', 1);
    error_reporting(E_ALL);

    $dbCredentials = require_once('dbCredentials.php');

    $dbHostName = $dbCredentials['dbHostName'];
    $dbName = $dbCredentials['dbName'];
    $dbUsername = $dbCredentials['dbUsername'];
    $dbPassword = $dbCredentials['dbPassword'];
    
    
    function getDbConnection() {
        global $dbHostName, $dbUsername, $dbPassword, $dbName;
        try {
            $conn = new PDO("mysql:host=$dbHostName; dbname=$dbName", $dbUsername, $dbPassword);
            $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $conn->exec('SET names utf8mb4');
            $conn->exec("SET time_zone = '+00:00'");
            return $conn;
        }
        catch (PDOException $error) {
            error_log('Errore connessione: ' . $error->getMessage());
            throw $error;
        }
    }
?>
