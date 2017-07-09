// Copyright (c) 2017 Matthew Brennan Jones <matthew.brennan.jones@gmail.com>
// This software is licensed under AGPL v3 or later
// http://github.com/workhorsy/comic_book_reader
"use strict";


const g_i18n_storage = {
	"A touch friendly HTML5 comic book reader that reads CBR, CBZ, CBT, and PDF files.": {
		"sp" : "Un lector de cómics HTML5 amigable al tacto que lee CBR, CBZ, CBT y archivos PDF",
		"de" : "Ein berührungsfreier HTML5-Comic-Leser, der CBR-, CBZ-, CBT- und PDF-Dateien liest.",
		"jp": "CBR、CBZ、CBT、およびPDFファイルを読み取るタッチフレンドリーなHTML5コミックブックリーダーです。",
		"ru": "Удобный в обращении читатель комиксов HTML5, который читает файлы CBR, CBZ, CBT и PDF.",
	},
	"Allow right click": {
		"sp": "Permitir clic derecho",
		"de" : "Klicken Sie mit der rechten Maustaste",
		"jp": "右クリックを許可する",
		"ru": "Разрешить правый щелчок",
	},
	"Archive contains no images.": {
		"sp": "El archivo no contiene imágenes.",
		"de" : "Archiv enthält keine Bilder.",
		"jp": "アーカイブに画像がありません。",
		"ru": "Архив не содержит изображений.",
	},
	"Check for updates": {
		"sp": "Buscar actualizaciones",
		"de" : "Auf Updates prüfen",
		"jp": "アップデートを確認",
		"ru": "Проверить наличие обновлений",
	},
	"Check for updates now": {
		"sp": "Buscar actualizaciones ahora",
		"de" : "Überprüfen Sie jetzt auf Updates",
		"jp": "今すぐ更新を確認する",
		"ru": "Проверить наличие обновлений",
	},
	"Clear all data": {
		"sp": "Borrar todos los datos",
		"de" : "Löschen Sie alle Daten",
		"jp": "すべてのデータを消去する",
		"ru": "Очистить все данные",
	},
	"Comic Book Reader": {
		"sp": "Lector de Cómic",
		"de" : "Comic-Leser",
		"jp": "コミックブックリーダー",
		"ru": "Читатель комиксов",
	},
	"Done clearing all data": {
		"sp": "Hecho borrar todos los datos",
		"de" : "Löschen aller Daten",
		"jp": "すべてのデータの消去を完了",
		"ru": "Выполнено очистка всех данных",
	},
	"Error": {
		"sp": "Error",
		"de" : "Fehler",
		"jp": "エラー",
		"ru": "ошибка",
	},
	"Failed to open 'rar' archive.": {
		"sp": "Error al abrir archivo 'rar'.",
		"de" : "Das 'rar'-Archiv konnte nicht geöffnet werden.",
		"jp": "'rar'アーカイブを開けませんでした。",
		"ru": "Не удалось открыть архив «rar».",
	},
	"Failed to open 'tar' archive.": {
		"sp": "Error al abrir archivo 'tar'.",
		"de" : "Das 'tar'-Archiv konnte nicht geöffnet werden.",
		"jp": "'tar'アーカイブを開けませんでした。",
		"ru": "Не удалось открыть архив «tar».",
	},
	"Failed to open 'zip' archive.": {
		"sp": "Error al abrir archivo 'zip'.",
		"de" : "Das 'zip'-Archiv konnte nicht geöffnet werden.",
		"jp": "'zip'アーカイブを開けませんでした。",
		"ru": "Не удалось открыть архив «zip».",
	},
	"Full Screen": {
		"sp": "Pantalla completa",
		"de" : "Vollbild",
		"jp": "全画面表示",
		"ru": "Полноэкранный",
	},
	"Library": {
		"sp": "Biblioteca",
		"de" : "Bibliothek",
		"jp": "としょうかん",
		"ru": "Библиотека",
	},
	"Library is empty": {
		"sp": "La biblioteca está vacía",
		"de" : "Bibliothek ist leer",
		"jp": "ライブラリが空です",
		"ru": "Библиотека пуста",
	},
	"Loading": {
		"sp": "Cargando",
		"de" : "Laden",
		"jp": "読み込み中",
		"ru": "загрузка",
	},
	"None": {
		"sp": "Ninguna",
		"de" : "Keiner",
		"jp": "なし",
		"ru": "Никто",
	},
	"of": {
		"sp": "de",
		"de" : "von",
		"jp": "の",
		"ru": "из",
	},
	"Open comic file": {
		"sp": "Abrir archivo cómico",
		"de" : "Comic-Datei öffnen",
		"jp": "コミックファイルを開く",
		"ru": "Открыть комический файл",
	},
	"Settings": {
		"sp": "Ajustes",
		"de" : "Einstellungen",
		"jp": "設定",
		"ru": "настройки",
	},
	"Software Version:": {
		"sp": "Versión del software:",
		"de" : "Softwareversion:",
		"jp": "ソフトウェアバージョン：",
		"ru": "Версия ПО:",
	},
	"Start": {
		"sp": "Comienzo",
		"de" : "Anfang",
		"jp": "開始",
		"ru": "Начало",
	},
	"Storage used:": {
		"sp": "Almacenamiento utilizado:",
		"de" : "Verwendete Lagerung:",
		"jp": "使用されたストレージ：",
		"ru": "Используемое хранилище:",
	},
	"The archive type is unknown": {
		"sp": "El tipo de archivo es desconocido",
		"de" : "Der Archivtyp ist unbekannt",
		"jp": "アーカイブタイプが不明です",
		"ru": "Тип архива неизвестен",
	},
	"Total users online": {
		"sp": "Total de usuarios en línea",
		"de" : "Alle Benutzer online",
		"jp": "オンラインユーザー総数",
		"ru": "Всего пользователей онлайн",
	},
	"Use higher quality page previews": {
		"sp": "Utilizar previsualizaciones de páginas de mayor calidad",
		"de" : "Verwenden Sie höherwertige Seitenvorschau",
		"jp": "より高品質のページプレビューを使用する",
		"ru": "Используйте более качественные предварительные просмотры страниц",
	},
	"Use smoothing when resizing images": {
		"sp": "Utilizar el suavizado al cambiar el tamaño de las imágenes",
		"de" : "Verwenden Sie Glättung bei der Größenänderung von Bildern",
		"jp": "画像のサイズを変更するときにスムージングを使用する",
		"ru": "Сглаживание при изменении размера изображений",
	},
	"Visit home page at github": {
		"sp": "Visita la página de inicio en github",
		"de" : "Besuchen Sie die Homepage bei github",
		"jp": "githubでホームページをご覧ください",
		"ru": "Посетить домашнюю страницу github",
	},
};

