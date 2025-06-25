<?php
    ini_set('display_errors', 1);
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
            $conn->exec('set names utf8mb4');
            return $conn;
        }
        catch (PDOException $e) {
            error_log('Errore connessione: ' . $e.getMessage());
            echo json_encode(['error' => 'Errore connessione: ']);
            exit();
        }
    }
?>