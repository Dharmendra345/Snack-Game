<?php

error_reporting(E_ERROR | E_PARSE);
ini_set('display_errors', '1');

// Connect to the database
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "snake_db";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Reset the auto-increment value to 1
$sql_reset_auto_increment = "ALTER TABLE high_score_table AUTO_INCREMENT = 1";
$conn->query($sql_reset_auto_increment);

// Get the score from the JavaScript
$score = $_POST['score'];

// Fetch the existing high score from the database
$sql = "SELECT high_score FROM high_score_table";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $existingHighScore = $row["high_score"];
    echo $existingHighScore;

    // Compare the new score with the existing high score
    if ($score > $existingHighScore) {
        // Update the high score in the database
        $updateSql = "UPDATE high_score_table SET high_score = $score";
        if ($conn->query($updateSql) === TRUE) {
            // High score updated successfully!
        } else {
            // Error updating high score.
        }
    } else {
        // Score is not higher than the existing high score, not updated.
    }
} else {
    // No existing high score, insert the new score
    $insertSql = "INSERT INTO high_score_table (ID, high_score) VALUES 
    (NULL, $score)";

    if ($conn->query($insertSql) === TRUE) {
        // Score saved as the new high score!
    } else {
        // Error inserting high score.
    }
}

$conn->close();
?>