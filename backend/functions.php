<?php
    function getAuthHeader() {
        if (isset($_SERVER['HTTP_AUTHORIZATION']))
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        elseif (isset($_SERVER['Authorization']))
            $authHeader = $_SERVER['Authorization'];
        elseif (function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            if (isset($headers['Authorization']))
                $authHeader = $headers['Authorization'];
        }

        if (isset($authHeader) && preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            return $matches[1];
        }
        else
            return null;
    }
?>