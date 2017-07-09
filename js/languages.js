// Copyright (c) 2017 Matthew Brennan Jones <matthew.brennan.jones@gmail.com>
// This software is licensed under AGPL v3 or later
// http://github.com/workhorsy/comic_book_reader
"use strict";


const g_i18n_storage = {
	"A touch friendly HTML5 comic book reader that reads CBR, CBZ, CBT, and PDF files.": {
		"de" : "Ein berührungsfreier HTML5-Comic-Leser, der CBR-, CBZ-, CBT- und PDF-Dateien liest.",
		"es": "Un lector de cómics HTML5 amigable al tacto que lee CBR, CBZ, CBT y archivos PDF",
		"ja": "CBR、CBZ、CBT、およびPDFファイルを読み取るタッチフレンドリーなHTML5コミックブックリーダーです。",
		"ru": "Удобный в обращении читатель комиксов HTML5, который читает файлы CBR, CBZ, CBT и PDF.",
	},
	"Allow right click": {
		"de" : "Klicken Sie mit der rechten Maustaste",
		"es": "Permitir clic derecho",
		"ja": "右クリックを許可する",
		"ru": "Разрешить правый щелчок",
	},
	"Archive contains no images.": {
		"de" : "Archiv enthält keine Bilder.",
		"es": "El archivo no contiene imágenes.",
		"ja": "アーカイブに画像がありません。",
		"ru": "Архив не содержит изображений.",
	},
	"Check for updates": {
		"de" : "Auf Updates prüfen",
		"es": "Buscar actualizaciones",
		"ja": "アップデートを確認",
		"ru": "Проверить наличие обновлений",
	},
	"Check for updates now": {
		"de" : "Überprüfen Sie jetzt auf Updates",
		"es": "Buscar actualizaciones ahora",
		"ja": "今すぐ更新を確認する",
		"ru": "Проверить наличие обновлений",
	},
	"Clear all data": {
		"de" : "Löschen Sie alle Daten",
		"es": "Borrar todos los datos",
		"ja": "すべてのデータを消去する",
		"ru": "Очистить все данные",
	},
	"Comic Book Reader": {
		"de" : "Comic-Leser",
		"es": "Lector de Cómic",
		"ja": "コミックブックリーダー",
		"ru": "Читатель комиксов",
	},
	"Done clearing all data": {
		"de" : "Löschen aller Daten",
		"es": "Hecho borrar todos los datos",
		"ja": "すべてのデータの消去を完了",
		"ru": "Выполнено очистка всех данных",
	},
	"Error": {
		"de" : "Fehler",
		"es": "Error",
		"ja": "エラー",
		"ru": "ошибка",
	},
	"Failed to open 'rar' archive.": {
		"de" : "Das 'rar'-Archiv konnte nicht geöffnet werden.",
		"es": "Error al abrir archivo 'rar'.",
		"ja": "'rar'アーカイブを開けませんでした。",
		"ru": "Не удалось открыть архив «rar».",
	},
	"Failed to open 'tar' archive.": {
		"de" : "Das 'tar'-Archiv konnte nicht geöffnet werden.",
		"es": "Error al abrir archivo 'tar'.",
		"ja": "'tar'アーカイブを開けませんでした。",
		"ru": "Не удалось открыть архив «tar».",
	},
	"Failed to open 'zip' archive.": {
		"de" : "Das 'zip'-Archiv konnte nicht geöffnet werden.",
		"es": "Error al abrir archivo 'zip'.",
		"ja": "'zip'アーカイブを開けませんでした。",
		"ru": "Не удалось открыть архив «zip».",
	},
	"Full Screen": {
		"de" : "Vollbild",
		"es": "Pantalla completa",
		"ja": "全画面表示",
		"ru": "Полноэкранный",
	},
	"Library": {
		"de" : "Bibliothek",
		"es": "Biblioteca",
		"ja": "としょうかん",
		"ru": "Библиотека",
	},
	"Library is empty": {
		"de" : "Bibliothek ist leer",
		"es": "La biblioteca está vacía",
		"ja": "ライブラリが空です",
		"ru": "Библиотека пуста",
	},
	"Loading": {
		"de" : "Laden",
		"es": "Cargando",
		"ja": "読み込み中",
		"ru": "загрузка",
	},
	"None": {
		"de" : "Keiner",
		"es": "Ninguna",
		"ja": "なし",
		"ru": "Никто",
	},
	"of": {
		"de" : "von",
		"es": "de",
		"ja": "の",
		"ru": "из",
	},
	"Open comic file": {
		"de" : "Comic-Datei öffnen",
		"es": "Abrir archivo cómico",
		"ja": "コミックファイルを開く",
		"ru": "Открыть комический файл",
	},
	"Settings": {
		"de" : "Einstellungen",
		"es": "Ajustes",
		"ja": "設定",
		"ru": "настройки",
	},
	"Software Version:": {
		"de" : "Softwareversion:",
		"es": "Versión del software:",
		"ja": "ソフトウェアバージョン：",
		"ru": "Версия ПО:",
	},
	"Start": {
		"de" : "Anfang",
		"es": "Comienzo",
		"ja": "開始",
		"ru": "Начало",
	},
	"Storage used:": {
		"de" : "Verwendete Lagerung:",
		"es": "Almacenamiento utilizado:",
		"ja": "使用されたストレージ：",
		"ru": "Используемое хранилище:",
	},
	"The archive type is unknown": {
		"de" : "Der Archivtyp ist unbekannt",
		"es": "El tipo de archivo es desconocido",
		"ja": "アーカイブタイプが不明です",
		"ru": "Тип архива неизвестен",
	},
	"Total users online": {
		"de" : "Alle Benutzer online",
		"es": "Total de usuarios en línea",
		"ja": "オンラインユーザー総数",
		"ru": "Всего пользователей онлайн",
	},
	"Use higher quality page previews": {
		"de" : "Verwenden Sie höherwertige Seitenvorschau",
		"es": "Utilizar previsualizaciones de páginas de mayor calidad",
		"ja": "より高品質のページプレビューを使用する",
		"ru": "Используйте более качественные предварительные просмотры страниц",
	},
	"Use smoothing when resizing images": {
		"de" : "Verwenden Sie Glättung bei der Größenänderung von Bildern",
		"es": "Utilizar el suavizado al cambiar el tamaño de las imágenes",
		"ja": "画像のサイズを変更するときにスムージングを使用する",
		"ru": "Сглаживание при изменении размера изображений",
	},
	"Visit home page at github": {
		"de" : "Besuchen Sie die Homepage bei github",
		"es": "Visita la página de inicio en github",
		"ja": "githubでホームページをご覧ください",
		"ru": "Посетить домашнюю страницу github",
	},
};

