<?php
require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;
$search = isset($_GET['search']) ? trim($_GET['search']) : null;

switch ($method) {

    case 'GET':
        if ($search) {
            $stmt = $pdo->prepare("SELECT * FROM productos WHERE nombre LIKE ? OR codigo LIKE ? ORDER BY id DESC");
            $like = "%$search%";
            $stmt->execute([$like, $like]);
        } else {
            $stmt = $pdo->query("SELECT * FROM productos ORDER BY id DESC");
        }
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        $stmt = $pdo->prepare("INSERT INTO productos (codigo, nombre, precio, stock, pais_origen) VALUES (?, ?, ?, ?, ?)");
        try {
            $stmt->execute([$data['codigo'], $data['nombre'], $data['precio'], $data['stock'], $data['pais_origen']]);
            echo json_encode(["message" => "Producto creado", "id" => $pdo->lastInsertId()]);
        } catch (PDOException $e) {
            http_response_code(400);
            echo json_encode(["error" => "Código duplicado o datos inválidos"]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        $stmt = $pdo->prepare("UPDATE productos SET codigo=?, nombre=?, precio=?, stock=?, pais_origen=? WHERE id=?");
        $stmt->execute([$data['codigo'], $data['nombre'], $data['precio'], $data['stock'], $data['pais_origen'], $id]);
        echo json_encode(["message" => "Producto actualizado"]);
        break;

    case 'DELETE':
        $stmt = $pdo->prepare("DELETE FROM productos WHERE id=?");
        $stmt->execute([$id]);
        echo json_encode(["message" => "Producto eliminado"]);
        break;
}