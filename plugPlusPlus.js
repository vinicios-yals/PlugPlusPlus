/*
------ Funcionalidades -------
Auto-woot
Auto-grab
Auto-join
Auto-respond
Previnir navegação acidental
Imagens do chat
Download da mídia
Notificações de menção na área de trabalho
Mensagens privadas | Depende de um socket server
Vídeo em tela cheia
Vídeos do youtube no chat
Emotes de chat 
Todos os emotes da origem
Todos os emotes da Twitch
Enviar seu emote | Utilizar API do imgur para fazer upload ou colocar a URL direta da imagem
Optimizar desempenho em 3 estágios (baixo, médio, alto)
*/

/*
------ Comandos Personalizados -------
/lenny
/shrug
/lookup ID | https://plug.dj/_/users/ID

------ Comandos para Staff -------
/skip
/clearchat
/kick @USER_NAME
/banhour @USER_NAME
/banday @USER_NAME
/banperm @USER_NAME

*/



/*
------ Cargos do Plug++ -------
* Estilo especial para membros com cargos do Plug++
Desenvolvedor // Vermelho
Colaborador // Verde
Suporte //  Azul
Tradutor // Roxo
Divulgador // Azul Claro
Doador // Dourado
*/

/*
autoWoot
$("#woot").click();

autoGrab
https://gist.github.com/Cammmmy/f1b1f25eb74b733600c6

autoJoin
$("#dj-button.is-join").click();

accidentalRefresh
window.onbeforeunload = function () {
return "Talvez você tenha clicado sem querer aí!";
}

desktopNotifications
http://stackoverflow.com/questions/2271156/chrome-desktop-notification-example#answer-13328513

Comandos para Staff
https://github.com/IgorAntun/antitroll-script/blob/master/antitroll_beta.js

*/

// Início
var plugPlusPlus = function plugPlusPlus() {

	var version = 'v1.0.0',
		roles = {
			developer: [6219413, 3703511],
			contributor: [],
			support: [],
			translator: [],
			advertiser: [],
			donator: [],
		};

	Chat('run', 'Plug++ now running ' + version);
	console.log('Plug++ now running ' + version);

	/* 
	* Salva todas as configurações no localStorage
	*/
	function saveSettings() {
		localStorage.setItem('plugPlusPlus', JSON.stringify(settings));
	}

	/* 
	* Carrega todas as configurações do localStorage
	*/
	function loadSettings() {
		var settings = JSON.parse(localStorage.getItem('plugPlusPlus'));
		if (settings == null)
			saveSettings(defaultSettings);
		loadSettings();
	}

	// Configurações pré-definidas
	var defaultSettings = {
		autoWoot: true,
		autoGrab: false,
		autoJoin: true, 
		autoRespond: false,
		respondMessage: "Sorry, but I am not available right now.",
		accidentalRefresh: true,
		videoInFullScreen: false,
		desktopNotifications: false,
		privateMessages: false,
		fullscreenVideo: false,
		chatYoutubePreview: false,
		chatImages: true,
		emotesDefault: true,
		emotesOrigem: false,
		emotesTwitch: false
	}

	// Configurações em tempo de execução
	var settings = {
		autoWoot: true,
		autoGrab: false,
		autoJoin: true, 
		autoRespond: false,
		respondMessage: "Sorry, but I am not available right now.",
		accidentalRefresh: true,
		videoInFullScreen: false,
		desktopNotifications: false,
		privateMessages: false,
		fullscreenVideo: false,
		chatYoutubePreview: false,
		chatImages: true,
		emotesDefault: true,
		emotesOrigem: false,
		emotesTwitch: false
	}

	/* 
	* Carrega todos os eventos do Plug.dj
	*/
	function loadUI() {
		$('head').append('<link rel="stylesheet" type="text/css" href="https://rawgit.com/vinicios-yals/PlugPlusPlus/master/pPP.css">');
		// $('body').append(' RESTO DA UI ');
		if (room === '/panelinha-radioativa') {
			!settings.privateMessages
		} 
	}
	loadUI();

	/* 
	* Carregar os eventos do Plug.dj via API
	*/
	function loadEvents() {
		API.on(API.CHAT, eventChat);
		API.on(API.CHAT_COMMAND, eventCommand);
		API.on(API.ADVANCE, eventAdvance);
	}
	loadEvents();

	/* 
	* Desligar, descarregar e remover
	*/
	function shutDown() {
		API.off(API.CHAT, eventChat);
		API.off(API.CHAT_COMMAND, eventCommand);
		saveSettings();
	}

	// importing from tastyplug
	function addChat(type, m) {
		if ($('#chat-button').css('display') == 'block') {
			var chat = $('#chat-messages'),
				a = chat.scrollTop() > chat[0].scrollHeight - chat.height() - 28,
				d = $('#chat-timestamp-button .icon').attr('class').substr(21),
				f = new Date().toTimeString().substr(0,5);
			if (d == '12') {
				var g = parseInt(f),
					h = g >= 12 ? 'pm' : 'am',
					i = g % 12 == 0 ? '12' : g % 12;
				f = i + f.substr(2) + h;
			}
			if (f.charAt(0) == '0')
				f = f.substr(1);
			chat.append('<div class="cm moderation plugPlusPlus-message pPP-' + type + '"><div class="badge-box"><i class="icon icon-star-white"></i></div><div class="msg"><div class="from"><span class="timestamp" style="display: inline;">' + f + '</span></div><div class="text">' + m + '</div></div></div>');
			if (a)
				chat.scrollTop(chat[0].scrollHeight);
			if (chat.children().length >= 512)
				chat.children().first().remove();
		} else {
			API.chatLog(m.replace(/<br>/g,', ').replace(/<\/?span>/g,''), true);
		}
	}

	/* 
	* Eventos do chat
	*/
	function eventChat(chat) {
		if (chat.type === "mention")
			if (settings.autoRespond === true)
				API.sendChat("[AFK] @" + chat.un + " " + settings.respondMessage);
	}

	/* 
	* Eventos de comandos
	*/
	function eventCommand(command) {
		command = command.substring(1);
		switch(command) {
			case "teste":
				$('#chat-input-field').val('teste'); // Não está funcionando ainda. 
			break;
		}
		console.log('Plug++ command executed: /' + command);
	}
	function eventAdvance(user) {
		this.getAutoWoot();
	}

	this.getAutoWoot = function getAutoWoot() {

	}

}
plugPlusPlus();