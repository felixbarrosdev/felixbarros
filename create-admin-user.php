<?php
/**
 * Script para crear un usuario administrador de prueba
 * Ejecutar desde la raíz de WordPress
 */

// Cargar WordPress
require_once( dirname( __FILE__ ) . '/../../../wp-load.php' );

// Datos del usuario
$username = 'admin';
$password = 'admin123';
$email = 'admin@test.com';

// Verificar si el usuario ya existe
if ( username_exists( $username ) || email_exists( $email ) ) {
    echo "El usuario '$username' ya existe.\n";
    exit;
}

// Crear el usuario
$user_id = wp_create_user( $username, $password, $email );

if ( is_wp_error( $user_id ) ) {
    echo "Error al crear el usuario: " . $user_id->get_error_message() . "\n";
} else {
    // Asignar rol de administrador
    $user = new WP_User( $user_id );
    $user->set_role( 'administrator' );
    
    echo "Usuario administrador creado exitosamente:\n";
    echo "Usuario: $username\n";
    echo "Contraseña: $password\n";
    echo "Email: $email\n";
    echo "\nPuedes acceder en: http://localhost:8000/wp-admin/\n";
}
?>