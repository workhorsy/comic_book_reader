// Copyright (c) 2017 Matthew Brennan Jones <matthew.brennan.jones@gmail.com>
// This software is licensed under AGPL v3 or later
// http://github.com/workhorsy/comic_book_reader
"use strict";


const g_i18n_storage = {
	"A touch friendly HTML5 comic book reader that reads CBR, CBZ, CBT, and PDF files.": {
		"es" : "Un lector de cómics HTML5 amigable al tacto que lee CBR, CBZ, CBT y archivos PDF",
		"de" : "Ein berührungsfreier HTML5-Comic-Leser, der CBR-, CBZ-, CBT- und PDF-Dateien liest.",
		"ja": "CBR、CBZ、CBT、およびPDFファイルを読み取るタッチフレンドリーなHTML5コミックブックリーダーです。",
		"ru": "Удобный в обращении читатель комиксов HTML5, который читает файлы CBR, CBZ, CBT и PDF.",
	},
	"Allow right click": {
		"es": "Permitir clic derecho",
		"de" : "Klicken Sie mit der rechten Maustaste",
		"ja": "右クリックを許可する",
		"ru": "Разрешить правый щелчок",
	},
	"Archive contains no images.": {
		"es": "El archivo no contiene imágenes.",
		"de" : "Archiv enthält keine Bilder.",
		"ja": "アーカイブに画像がありません。",
		"ru": "Архив не содержит изображений.",
	},
	"Check for updates": {
		"es": "Buscar actualizaciones",
		"de" : "Auf Updates prüfen",
		"ja": "アップデートを確認",
		"ru": "Проверить наличие обновлений",
	},
	"Check for updates now": {
		"es": "Buscar actualizaciones ahora",
		"de" : "Überprüfen Sie jetzt auf Updates",
		"ja": "今すぐ更新を確認する",
		"ru": "Проверить наличие обновлений",
	},
	"Clear all data": {
		"es": "Borrar todos los datos",
		"de" : "Löschen Sie alle Daten",
		"ja": "すべてのデータを消去する",
		"ru": "Очистить все данные",
	},
	"Comic Book Reader": {
		"es": "Lector de Cómic",
		"de" : "Comic-Leser",
		"ja": "コミックブックリーダー",
		"ru": "Читатель комиксов",
	},
	"Done clearing all data": {
		"es": "Hecho borrar todos los datos",
		"de" : "Löschen aller Daten",
		"ja": "すべてのデータの消去を完了",
		"ru": "Выполнено очистка всех данных",
	},
	"Error": {
		"es": "Error",
		"de" : "Fehler",
		"ja": "エラー",
		"ru": "ошибка",
	},
	"Failed to open 'rar' archive.": {
		"es": "Error al abrir archivo 'rar'.",
		"de" : "Das 'rar'-Archiv konnte nicht geöffnet werden.",
		"ja": "'rar'アーカイブを開けませんでした。",
		"ru": "Не удалось открыть архив «rar».",
	},
	"Failed to open 'tar' archive.": {
		"es": "Error al abrir archivo 'tar'.",
		"de" : "Das 'tar'-Archiv konnte nicht geöffnet werden.",
		"ja": "'tar'アーカイブを開けませんでした。",
		"ru": "Не удалось открыть архив «tar».",
	},
	"Failed to open 'zip' archive.": {
		"es": "Error al abrir archivo 'zip'.",
		"de" : "Das 'zip'-Archiv konnte nicht geöffnet werden.",
		"ja": "'zip'アーカイブを開けませんでした。",
		"ru": "Не удалось открыть архив «zip».",
	},
	"Full Screen": {
		"es": "Pantalla completa",
		"de" : "Vollbild",
		"ja": "全画面表示",
		"ru": "Полноэкранный",
	},
	"Library": {
		"es": "Biblioteca",
		"de" : "Bibliothek",
		"ja": "としょうかん",
		"ru": "Библиотека",
	},
	"Library is empty": {
		"es": "La biblioteca está vacía",
		"de" : "Bibliothek ist leer",
		"ja": "ライブラリが空です",
		"ru": "Библиотека пуста",
	},
	"Loading": {
		"es": "Cargando",
		"de" : "Laden",
		"ja": "読み込み中",
		"ru": "загрузка",
	},
	"None": {
		"es": "Ninguna",
		"de" : "Keiner",
		"ja": "なし",
		"ru": "Никто",
	},
	"of": {
		"es": "de",
		"de" : "von",
		"ja": "の",
		"ru": "из",
	},
	"Open comic file": {
		"es": "Abrir archivo cómico",
		"de" : "Comic-Datei öffnen",
		"ja": "コミックファイルを開く",
		"ru": "Открыть комический файл",
	},
	"Settings": {
		"es": "Ajustes",
		"de" : "Einstellungen",
		"ja": "設定",
		"ru": "настройки",
	},
	"Software Version:": {
		"es": "Versión del software:",
		"de" : "Softwareversion:",
		"ja": "ソフトウェアバージョン：",
		"ru": "Версия ПО:",
	},
	"Start": {
		"es": "Comienzo",
		"de" : "Anfang",
		"ja": "開始",
		"ru": "Начало",
	},
	"Storage used:": {
		"es": "Almacenamiento utilizado:",
		"de" : "Verwendete Lagerung:",
		"ja": "使用されたストレージ：",
		"ru": "Используемое хранилище:",
	},
	"The archive type is unknown": {
		"es": "El tipo de archivo es desconocido",
		"de" : "Der Archivtyp ist unbekannt",
		"ja": "アーカイブタイプが不明です",
		"ru": "Тип архива неизвестен",
	},
	"Total users online": {
		"es": "Total de usuarios en línea",
		"de" : "Alle Benutzer online",
		"ja": "オンラインユーザー総数",
		"ru": "Всего пользователей онлайн",
	},
	"Use higher quality page previews": {
		"es": "Utilizar previsualizaciones de páginas de mayor calidad",
		"de" : "Verwenden Sie höherwertige Seitenvorschau",
		"ja": "より高品質のページプレビューを使用する",
		"ru": "Используйте более качественные предварительные просмотры страниц",
	},
	"Use smoothing when resizing images": {
		"es": "Utilizar el suavizado al cambiar el tamaño de las imágenes",
		"de" : "Verwenden Sie Glättung bei der Größenänderung von Bildern",
		"ja": "画像のサイズを変更するときにスムージングを使用する",
		"ru": "Сглаживание при изменении размера изображений",
	},
	"Visit home page at github": {
		"es": "Visita la página de inicio en github",
		"de" : "Besuchen Sie die Homepage bei github",
		"ja": "githubでホームページをご覧ください",
		"ru": "Посетить домашнюю страницу github",
	},
};

