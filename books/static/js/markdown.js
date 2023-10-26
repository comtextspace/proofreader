const config = {
	'toolbar': {
		'items': [
			'undo','redo',
			'|',
			'heading',
			'|',
			'bold',	'italic', 'strikethrough', 'code',
			'|',
			'bulletedList', 'numberedList', 'todoList', 'outdent', 'indent',
			'|',
			'link', 'mediaEmbed', 'imageInsert', 'blockQuote', 'codeBlock',
			'|',
			'insertTable',
			'|',
			'horizontalLine', 'sourceEditing',
			'|',
			'findAndReplace', 'specialCharacters', 'showBlocks',
			'|',
			'removeFormat',
		],
		'shouldNotGroupWhenFull': true
	},
	'image': {
		'toolbar': [
			'imageTextAlternative',
			'toggleImageCaption',
			'imageStyle:inline',
			'imageStyle:block',
			'imageStyle:side',
			'linkImage'
		],
		'upload': {
			'types': [
				'jpeg',
				'png',
				'gif',
				'bmp',
				'webp',
				'tiff',
				'webp',
				'svg'
			]
		},
		'resizeUnit': '%',
		'resizeOptions': [
			{
				'name': 'resizeImage:original',
				'value': null,
				'icon': 'original'
			},
			{
				'name': 'resizeImage:25',
				'value': '25',
				'icon': 'small'
			},
			{
				'name': 'resizeImage:50',
				'value': '50',
				'icon': 'medium'
			},
			{
				'name': 'resizeImage:75',
				'value': '75',
				'icon': 'large'
			}
		],
	},
	'table': {
		'contentToolbar': [
			'tableColumn',
			'tableRow',
			'mergeTableCells',
			'tableCellProperties',
			'tableProperties'
		],
	},
	'alignment': {
		'options': [
			{
				'name': 'left'
			},
			{
				'name': 'right'
			},
			{
				'name': 'center'
			},
			{
				'name': 'justify'
			}
		]
	},
	'codeBlock': {
		'languages': [
			{
				'language': 'plaintext',
				'label': 'Plain text'
			},
			{
				'language': 'c',
				'label': 'C'
			},
			{
				'language': 'cs',
				'label': 'C#'
			},
			{
				'language': 'cpp',
				'label': 'C++'
			},
			{
				'language': 'css',
				'label': 'CSS'
			},
			{
				'language': 'diff',
				'label': 'Diff'
			},
			{
				'language': 'html',
				'label': 'HTML'
			},
			{
				'language': 'java',
				'label': 'Java'
			},
			{
				'language': 'javascript',
				'label': 'JavaScript'
			},
			{
				'language': 'php',
				'label': 'PHP'
			},
			{
				'language': 'python',
				'label': 'Python'
			},
			{
				'language': 'ruby',
				'label': 'Ruby'
			},
			{
				'language': 'typescript',
				'label': 'TypeScript'
			},
			{
				'language': 'xml',
				'label': 'XML'
			}
		],
		'indentSequence': '\t'
	},
	'list': {
		'multiBlock': true,
		'properties': {
			'styles': true,
			'startIndex': false,
			'reversed': false
		}
	},
	'heading': {
		'options': [
			{
				'model': 'paragraph',
				'title': 'Paragraph',
				'class': 'ck-heading_paragraph'
			},
			{
				'model': 'heading1',
				'view': 'h2',
				'title': 'Heading 1',
				'class': 'ck-heading_heading1'
			},
			{
				'model': 'heading2',
				'view': 'h3',
				'title': 'Heading 2',
				'class': 'ck-heading_heading2'
			},
			{
				'model': 'heading3',
				'view': 'h4',
				'title': 'Heading 3',
				'class': 'ck-heading_heading3'
			},
			{
				'model': 'heading4',
				'view': 'h5',
				'title': 'Heading 4',
				'class': 'ck-heading_heading3'
			}
		]
	},
	'indentBlock': {
		'offset': 40,
		'unit': 'px'
	},
	'link': {
		'addTargetToExternalLinks': false
	},
	'typing': {
		'transformations': {
			'include': [
				'symbols',
				'mathematical',
				'typography',
				'quotes'
			]
		}
	},
	'removePlugins': [
		'MediaEmbedToolbar',
		'Title'
	]
};
ClassicEditor.create(document.querySelector('textarea.resizeable-textarea'), config).then(editor => {
	window.editor = editor;
	/*console.log(editor);*/
}).catch(error => {
	console.error(error);
});