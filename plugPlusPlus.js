var plugPlusPlus = function plugPlusPlus() {

	var u = API.getUser(),
		me = this,
		version = {
			major: '3',
			minor: '0',
			patch: '0'
		},
		language = {
			en: {
				running: 'Now running ',
				afkMessage: 'Sorry, but I am not available right now.',
				enableAutoWoot: 'Auto-Woot was enabled!',
				disableAutoWoot: 'Auto-Woot was disabled!',
				enableAutoGrab: 'Auto-Grab was enabled!',
				disableAutoGrab: 'Auto-Grab was disabled!',
				enableAutoJoin: 'Auto-Join was enabled!',
				disableAutoJoin: 'Auto-Join was disabled!',
				enableAfkRespond: 'AFK-Respond was enabled!',
				disableAfkRespond: 'AFK-Respond was disabled!',
				afkRespondSetMessage: 'AFK Respond Message set to: ',
				enableAccidentalRefresh: 'Accidental Refresh was enabled!',
				disableAccidentalRefresh: 'Accidental Refresh was disabled!',
				accidentalRefreshMessage: 'I think you misclicked there!',
				enableDesktopNotifications: 'Desktop Notifications was enabled!',
				disableDesktopNotifications: 'Desktop Notifications was disabled!',
				enableChatYoutubePreview: 'Chat YouTube Preview was enabled!',
				disableChatYoutubePreview: 'Chat YouTube Preview was disabled!',
				enableChatImages: 'Chat Images was enabled!',
				disableChatImages: 'Chat Images was disabled!',
				userNotFound: 'User not found.',
				cmdPing: 'Your ping to the plug.dj server is: ',
				cmdMute: 'You must specify a time! Possible arguments are:<br />15 minutes: s or 15<br />30 minutes: m or 30<br />45 minutes: l or 45',
				cmdPromote: 'You must specify! Possible arguments are:<br />Resident Dj: 1 or residentdj<br />Bouncer: 2 or bouncer<br />Manager: 3 or manager<br />CO-Host: 4 or cohost<br />Host: 5 or host',
				cmdTitle: 'Community name set to: ',
				uFJoin: 'Your friend entered the community.',
				uJoin: 'A user entered the community.',
				uFLeave: 'Your friend has left the community.', 
				uLeave: 'A user has left the community.'
			},
			pt: {
				running: 'Está ativo ',
				afkMessage: 'Desculpe, mas não estou disponível neste momento.',
				enableAutoWoot: 'Auto-Woot foi habilitado!',
				disableAutoWoot: 'Auto-Woot foi desabilitado!',
				enableAutoGrab: 'Auto-Grab foi habilitado!',
				disableAutoGrab: 'Auto-Grab foi desabilitado!',
				enableAutoJoin: 'Auto-Join foi habilitado!',
				disableAutoJoin: 'Auto-Join foi desabilitado!',
				enableAfkRespond: 'AFK-Respond foi habilitado!',
				disableAfkRespond: 'AFK-Respond foi desabilitado!',
				afkRespondSetMessage: 'AFK-Respond Message definido para: ',
				enableAccidentalRefresh: 'Accidental Refresh foi habilitado!',
				disableAccidentalRefresh: 'Accidental Refresh foi desabilitado!',
				accidentalRefreshMessage: 'Eu acho que você clicou sem querer aí!',
				enableDesktopNotifications: 'Desktop Notifications foi habilitado!',
				disableDesktopNotifications: 'Desktop Notifications foi desabilitado!',
				enableChatYoutubePreview: 'Chat YouTube Preview foi habilitado!',
				disableChatYoutubePreview: 'Chat YouTube Preview foi desabilitado!',
				enableChatImages: 'Chat Images foi habilitado!',
				disableChatImages: 'Chat Images foi desabilitado!',
				userNotFound: 'Usuário não encontrado.',
				cmdPing: 'Seu ping para o servidor do plug.dj é: ',
				cmdMute: 'Seja mais especifico! Os argumentos são:<br />15 minutos: s ou 15<br />30 minutos: m ou 30<br />45 minutos: l ou 45',
				cmdPromote: 'Seja mais especifico! Os argumentos são:<br />DJ Residente: 1 ou residentdj<br />Segurança: 2 ou bouncer<br />Coordenador: 3 ou manager<br />CO-Host: 4 ou cohost<br />Host: 5 ou host',
				cmdTitle: 'Nome da comunidade definido para: ',
				uFJoin: 'Seu amigo entrou na comunidade.',
				uJoin: 'Um usuário entrou na comunidade.',
				uFLeave: 'Seu amigo deixou a comunidade.', 
				uLeave: 'Um usuário deixou a comunidade.'
			}
		}, roles;

		$.get('https://rawgit.com/vinicios-yals/PlugPlusPlus/master/roles.json', function (result) {
			roles = result;
		});

	/*
	* Salva todas as configurações no localStorage
	*/
	function saveSettings() {
		localStorage.setItem('plugPlusPlus', JSON.stringify(me.settings));
	}

	/* 
	* Carrega todas as configurações do localStorage
	*/
	function loadSettings() {
		if (localStorage.getItem('plugPlusPlus') == null)
			saveSettings();
		me.settings = JSON.parse(localStorage.getItem('plugPlusPlus'));
	}

	// Configurações em tempo de execução
	me.settings = {
		autoWoot: true,
		autoGrab: false,
		autoJoin: false, 
		afkRespond: false,
		afkMessage: language[u.language].afkMessage,
		accidentalRefresh: true,
		desktopNotifications: false,
		privateMessages: false,
		chatYoutubePreview: false,
		chatImages: true,
		emotesDefault: true,
		emotesOrigem: false,
		emotesTwitch: false,
		shutdown: null
	}

	/* 
	* Adiciona toda a UI
	*/
	function loadUI() {
		$('head').append('<link rel="stylesheet" type="text/css" href="https://rawgit.com/vinicios-yals/PlugPlusPlus/master/plugPlusPlus.css" id="css-plugPlusPlusUI">');
		$('body').append('<div id="plugPlusPlusUI"></div>');
		$('#plugPlusPlusUI').append('<div id="pPPUI-leftBAR"></div>');
		$('#plugPlusPlusUI').append('<div id="pPPUI-button"></div>');
		$('#pPPUI-button').append('<i class="pPPUI-logo">');

		// if (room === '/panelinha-radioativa') {
		// 	!me.settings.privateMessages
		// } 
	}

	/* 
	* Remove toda a UI
	*/
	function unloadUI() {
		$('#css-plugPlusPlusUI').remove();
		$('body').prepend('#plugPlusPlusUI');
	}
	
	/* 
	* Carrega todos os eventos do plug.dj
	*/
	function loadEvents() {
		API.on(API.CHAT, eventChat);
		API.on(API.CHAT_COMMAND, eventCmd);
		API.on(API.USER_JOIN, eventUserJoin);
		API.on(API.USER_LEAVE, eventUserLeave);
		API.on(API.ADVANCE, eventAdvance);
		API.on(API.VOTE_UPDATE, eventVote);
		API.on(API.GRAB_UPDATE, eventGrab);
	}

	/* 
	* Descarrega todos os eventos do plug.dj
	*/
	function unloadEvents() {
		API.off(API.CHAT, eventChat);
		API.off(API.CHAT_COMMAND, eventCmd);
		API.off(API.USER_JOIN, eventUserJoin);
		API.off(API.USER_LEAVE, eventUserLeave);
		API.off(API.ADVANCE, eventAdvance);
		API.off(API.VOTE_UPDATE, eventVote);
		API.off(API.GRAB_UPDATE, eventGrab);
	}

	/* 
	* Adiciona uma mensagem local ao chat
	*/
	function addChat(type, message, from, icon) {
		var from = from == undefined ? '<span class="app-name">plug<span class="plusplus">++</span></span>' : from;
			icon = icon == undefined ? 'inventory-white' : icon;

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
			chat.append('<div class="cm moderation plugPlusPlus-message pPP-' + type + '"><div class="badge-box"><i class="icon icon-' + icon + '"></i></div><div class="msg"><div class="from">' + from + '<span class="timestamp" style="display: inline;">' + f + '</span></div><div class="text">' + message + '</div></div></div>');
			if (a)
				chat.scrollTop(chat[0].scrollHeight);
			if (chat.children().length >= 512)
				chat.children().first().remove();
		} else {
			API.chatLog(m.replace(/<br>/g,', ').replace(/<\/?span>/g,''), true);
		}
	}

	/* 
	* Visualiza todas as informações do usuário especificado pelo Username
	*/
	function userLookUp(username) {
		var usersInRoom = API.getUsers();
		if (username != undefined) {
			var name = username.substr(1);
			for (i = 0; i < usersInRoom.length; i++) {
				if (usersInRoom[i].username === name)
					return usersInRoom[i];
			}
		}
		return false;
	}


	/* 
	* Cria a lista de Woot/Grab/Meh de todos os usuários
	*/
	var scoreboard = {woot:[], grab:[], meh:[]};
	function listScoreBoard() {
		$('#vote').prepend('<div id="scoreboard" style="display:none;"><div class="scoreboard-bar"></div><div class="list woot" style="display:none;"></div><div class="list grab" style="display:none;"></div><div class="list meh" style="display:none;"></div></div>');

		var users = API.getUsers(),
			$scoreboard = $('#vote > #scoreboard'), userIcon;

		$scoreboard.css('width', Number($scoreboard.parent().css('width').substr(0, 3)) - 4);

		$('.crowd-response').on('mouseenter', function(){
			var voteType = $(this).attr('id');

			$scoreboard.find('.list.' + voteType + ' > div').size() > 0 ? $scoreboard.show() : $scoreboard.hide();
			$scoreboard.find('.scoreboard-bar').removeClass('woot grab meh');
			$scoreboard.find('.scoreboard-bar').addClass(voteType);
			$scoreboard.find('.list').hide();
			$scoreboard.find('.list.' + voteType).show();
		});

		$('#vote').on('mouseleave', function(){
			$scoreboard.hide();
			$scoreboard.find('.scoreboard-bar').removeClass('woot grab meh');
			$scoreboard.find('.list').hide();
		});

		for (var i = 0; i < users.length; i++) {
			if (users[i].vote != 0)
				addVoteScoreBoard({id: users[i].id, username: users[i].username, role: users[i].role}, users[i].grab ? 'grab' : (users[i].vote > 0 ? 'woot' : 'meh'));
		}
	}

	/* 
	* Adiciona um voto Woot/Grab/Meh de um usuário
	*/
	function addVoteScoreBoard(user, voteType) {
			if (voteType == 'woot' || voteType == 'meh')
				removeVoteScoreBoard(user.id, voteType);

			var userIcon = '<i class="icon icon-chat-';
			if (user.role == 1) {
				userIcon += 'dj"></i>';
			} else if(user.role == 2) {
				userIcon += 'bouncer"></i>';
			} else if(user.role == 3) {
				userIcon += 'manager"></i>';
			} else if(user.role >= 4) {
				userIcon += 'host"></i>';
			}
			scoreboard[voteType].push(user);
			$('#vote > #scoreboard > .list.' + voteType).append('<div id="uid-' + user.id + '">' + (user.role > 0 ? userIcon : '') + '<span class="' + (user.role > 0 ? 'role-staff' : '') + '">' + user.username + '</span></div>');
	}

	/* 
	* Remove um voto Woot/meh
	*/
	function removeVoteScoreBoard(userId, voteType) {

		voteType = (voteType == 'woot' ? 'meh' : 'woot');

		var voteKey = scoreboard[voteType].map(function(e) { return e.id; }).indexOf(userId);
		if (voteKey >= 0) {
			scoreboard[voteType].splice(voteKey, 1);
			$('#vote > #scoreboard > .list.' + voteType + ' > div#uid-' + userId).remove();
		}
	}

	/* 
	* Desligar, descarregar e remover
	*/
	me.shutDown = function() {
		saveSettings();
		unloadUI();
		unloadEvents();
		addChat('run', 'Shutting down..');
		pPP = undefined;
		console.log('Shutting down..');
	}

	/* 
	* Da woot na mídia
	*/
	me.autoWoot = function() {
		if (me.settings.autoWoot && API.getDJ().id !== u.id && !$('#woot').hasClass('selected'))
			$('#woot').click();
	}

	/* 
	* Adiciona a mídia a playlist selecionada
	*/
	me.autoGrab = function() {
		if (me.settings.autoGrab && API.getDJ().id !== u.id) {
			$('#grab').click();
			$('.pop-menu.grab').hide();
			$('.pop-menu.grab > .menu > ul > li').each(function() {
				$(this).find('.icon.icon-check-purple').parent().mousedown();
			});
		}
	}

	/* 
	* Da join na lista de DJs
	*/
	me.autoJoin = function() {
		if (me.settings.autoJoin && !$('#dj-button').hasClass('is-locked') && API.getWaitListPosition() == -1 && API.getDJ().id !== u.id)
				API.djJoin();
	}

	/* 
	* Previne uma atualização ou mudança de página repentina
	*/
	me.accidentalRefresh = function() {
		window.onbeforeunload = me.settings.accidentalRefresh ? function() { return language[u.language].accidentalRefreshMessage; } : null;
	}

	/* 
	* Evento do chat
	*/
	function eventChat(chat) {
		var userId = Number((chat.cid).split('-')[0]),
			user = API.getUser(userId),
			messageElement = $('#chat-messages .cm[data-cid="' + chat.cid + '"]');

		if ($.inArray(userId, roles.promoter) >= 0) {
			messageElement.addClass('role-promoter');
			messageElement.find('.from').prepend('<i class="icon icon-role promoter"></i>');
		}

		if ($.inArray(userId, roles.translator) >= 0) {
			messageElement.addClass('role-translator');
			messageElement.find('.from').prepend('<i class="icon icon-role translator"></i>');
		}

		if ($.inArray(userId, roles.support) >= 0) {
			messageElement.addClass('role-support');
			messageElement.find('.from').prepend('<i class="icon icon-role support"></i>');
		}

		if ($.inArray(userId, roles.donator) >= 0) {
			messageElement.addClass('role-donator');
			messageElement.find('.from').prepend('<i class="icon icon-role donator" ></i>');
		}

		if ($.inArray(userId, roles.collaborator) >= 0) {
			messageElement.addClass('role-collaborator');
			messageElement.find('.from').prepend('<i class="icon icon-role collaborator"></i>');
		}

		if ($.inArray(userId, roles.developer) >= 0) {
			messageElement.addClass('role-developer');
			messageElement.find('.from').prepend('<i class="icon icon-role developer"></i>');
		}

		// Marca se a mensagem é da equipe
		if (user.role > 1)
			messageElement.addClass('role-staff');

		// Marca se a mensagem é de um amigo
		if (user.friend)
			messageElement.addClass('role-friend');

		// Abre midias no chat
		/*if (me.settings.chatImages)
			messageElement.find('.msg').find('.text > a').each(function() {
				var $link = $(this),
					link = $link.attr('href'),
					linkSplit = link.split('.'),
					linkExt = linkSplit[linkSplit.length - 1];

				if (linkExt == 'jpg' || linkExt == 'png' || linkExt == 'gif')
					$link.html('<img src="' + link + '" class="cimg">').load(function() {
						$('#chat-messages').scrollTop($('#chat-messages')[0].scrollHeight);
					});
			});*/

		// Responde quando está afk
		if (chat.type == "mention" && me.settings.afkRespond && chat.uid != u.id && chat.message.substr(0, 7) != "[AFK] @")
			API.sendChat("[AFK] @" + chat.un + " " + me.settings.afkMessage);

		// Deleta mensagens de afks (esse script só é executado caso você seja um segurança+)
		if (u.role > 1 && chat.message.substr(0, 7) == "[AFK] @")
			setTimeout(function() {
				$.ajax({
					type: 'DELETE',
					url: '/_/chat/' + chat.cid
				});
			}, 30 * 1000);

		// Desabilita o afk respond e o auto join (esse script só é ativo se a sala não permitir os mesmos)
		if (chat.message == "!afkdisable" && user.role > 1) {
			if (me.settings.afkRespond) {
				pPP.toggleAfkRespond();
				API.sendChat('@' + chat.un + ' AFK-Respond was disabled!');
			}
		} else if (chat.message == "!joindisable" && user.role > 1) {
			if (me.settings.autoJoin) {
				pPP.toggleAutoJoin();
				API.sendChat('@' + chat.un + ' Auto-Join was disabled!');
			}
		}

		// Desliga o afk respond caso não seja uma mensagem AFK enviada por u
		if (userId == u.id && me.settings.afkRespond && chat.message.substr(0, 7) != "[AFK] @") {
			pPP.toggleAfkRespond();
			addChat('message', me.settings.afkRespond ? language[u.language].enableAfkRespond : language[u.language].disableAfkRespond);
		}

		// Habilita o self-delete
		if (u.username == chat.un && user.role > 1) {
			messageElement.addClass('deletable');
			messageElement.append('<div class="delete-button" style="display: none;"><i class="icon icon-delete"></i></div>');
			messageElement.on('mouseenter', function(){
				$(this).find('.delete-button').show();
			}).on('mouseleave', function(){
				$(this).find('.delete-button').hide();
			});
			messageElement.find('.delete-button').on('click', function(){
				API.moderateDeleteChat(chat.cid);
			});
		}

		messageElement.find('.delete-button').html('<i class="icon icon-delete"></i>');
	}

	/* 
	* Evento de comandos
	*/
	function eventCmd(cmd) {
		var args = cmd.split(' '),
			user = userLookUp(args[1]),
			command = args[0].substr(1).toLowerCase();
		switch (command) {
			/* EMOTICONS */
			case 'shrug':
				API.sendChat(cmd.substr(6) + " ¯\\_(ツ)_/¯");
			break;
			case 'lenny':
				API.sendChat(cmd.substr(6) + " ( ͡° ͜ʖ ͡°)");
			break;
			case 'cat':
				API.sendChat(cmd.substr(4) + " =^.^=");
			break;
			case 'crazy':
				API.sendChat(cmd.substr(6) + " {{{(>_<)}}}");
			break;
			case 'coolsong':
				API.sendChat(cmd.substr(9) + " d(^_^)b");
			break;
			case 'cry':
				API.sendChat(cmd.substr(4) + " (╥﹏╥)");
			break;
			case 'yuno':
				API.sendChat(cmd.substr(5) + " ლ(ಠ益ಠლ)");
			break;
			case 'bearface':
				API.sendChat(cmd.substr(9) + " ʕ•ᴥ•ʔ");
			break;
			case 'wtf':
				API.sendChat(cmd.substr(4) + " ಠ_ಠ");
			break;
			case 'iamfine':
				API.sendChat(cmd.substr(8) + " ⁀‿⁀");
			break;
			case 'iamangry':
				API.sendChat(cmd.substr(9) + " ╰_╯");
			break;
			case 'facepalm':
				API.sendChat(cmd.substr(9) + " (>ლ)");
			break;
			case 'shy':
				API.sendChat(cmd.substr(4) + " (｡◕‿◕｡)");
			break;
			case 'dwi':
				API.sendChat(cmd.substr(4) + " (⌐■_■)");
			break;
			case 'x1':
				API.sendChat(cmd.substr(3) + " (ง'̀-'́)ง");
			break;
			case 'machoman':
				API.sendChat(cmd.substr(9) + " ᕦ( ͡° ͜ʖ ͡°)ᕤ");
			break;
			case 'runsong':
				API.sendChat(cmd.substr(8) + " ᕕ(⌐■_■)ᕗ ♪♬");
			break;
			case 'gasp':
				API.sendChat(cmd.substr(5) + " (ʘᗩʘ’)");
			break;
			case 'creepy':
				API.sendChat(cmd.substr(7) + " ╭(ʘ̆~◞౪◟~ʘ̆)╮");
			break;
			case 'pls':
				API.sendChat(cmd.substr(4) + " 〳 •́ ﹏ •̀ 〵");
			break;
			case 'partyover':
				API.sendChat(cmd.substr(10) + " ᕕ{  ͒ ʖ̯  ͒  }ᕗ");
			break;
			case 'aww':
				API.sendChat(cmd.substr(4) + " ʕ ಡ ﹏ ಡ ʔ");
			break;
			case 'wise':
				API.sendChat(cmd.substr(5) + " (҂ ˘ _ ˘ )");
			break;
			case 'this':
				API.sendChat(cmd.substr(5) + " ☜(ﾟヮﾟ☜)");
			break;
			case 'squad':
				API.sendChat(cmd.substr(6) + " ヽ༼ ຈل͜ຈ༼ ▀̿̿Ĺ̯̿̿▀̿ ̿༽Ɵ͆ل͜Ɵ͆ ༽ﾉ");
			break;
			case 'itsmagic':
				API.sendChat(cmd.substr(9) + " (⊃｡•́‿•̀｡)⊃━☆ﾟ.*･｡ﾟ");
			break;
			case 'wat':
				API.sendChat(cmd.substr(4) + " ʕ ͠° ʖ̫ °͠ ʔ");
			break;
			case 'whatever':
				API.sendChat(cmd.substr(9) + " ¯\\_(⊙_ʖ⊙)_/¯");
			break;
			case 'm8':
				API.sendChat(cmd.substr(3) + " ლ ( ◕  ᗜ  ◕ ) ლ");
			break;
			case 'cool':
				API.sendChat(cmd.substr(5) + " s( ^ ‿ ^)-b");
			break;
			case 'praise':
				API.sendChat(cmd.substr(7) + " ༼つ ◕_◕ ༽つ");
			break;
			case 'gary':
				API.sendChat(cmd.substr(7) + " ᕕ( ᐛ )ᕗ");
			break;
			/* END EMOTICONS */
			case 'lmgtfy':
				API.sendChat("http://lmgtfy.com/?q=" + encodeURI(cmd.substr(7)));
			break;
			case 'ping':
				// ...
			break;
			case 'whois':
				if (user != false) {
					addChat('info', "Username: " + user.username + "<br />" +
									"ID: " + user.id + "<br />" +
									"Profile URL: <a href=\"https://plug.dj/@/" + user.slug + "\"></a>https://plug.dj/@/" + user.slug + "<br />" +
									"Level: " + user.level + "<br />");
				} else {
					addChat('error', language[u.language].userNotFound);
				}
			break;
			case 'autowoot':
				pPP.toggleAutoWoot();
				addChat('message', me.settings.autoWoot ? language[u.language].enableAutoWoot : language[u.language].disableAutoWoot, undefined, 'woot-disabled');
			break;
			case 'autograb':
				pPP.toggleAutoGrab();
				addChat('message', me.settings.autoGrab ? language[u.language].enableAutoGrab : language[u.language].disableAutoGrab, undefined, 'grab-disabled');
			break;
			case 'autojoin':
				pPP.toggleAutoJoin();
				addChat('message', me.settings.autoJoin ? language[u.language].enableAutoJoin : language[u.language].disableAutoJoin, undefined, 'join-waitlist');
			break;
			case 'afkrespond':
				pPP.toggleAfkRespond();
				addChat('message', me.settings.afkRespond ? language[u.language].enableAfkRespond : language[u.language].disableAfkRespond, undefined, 'private-chat');
			break;
			case 'afkmessage':
				pPP.setAfkMessage(cmd.substr(11));
				addChat('message', language[u.language].afkRespondSetMessage + cmd.substr(11));
				saveSettings();
			break;
			case 'accidentalrefresh':
				pPP.toggleAccidentalRefresh();
				addChat('message', me.settings.accidentalRefresh ? language[u.language].enableAccidentalRefresh : language[u.language].disableAccidentalRefresh);
			break;
			case 'inlinevideos':
			case 'chatvideos':
				// ...
			break;
			case 'inlineimages':
			case 'chatimages':
				pPP.toggleChatImages();
				addChat('message', me.settings.chatImages ? language[u.language].enableChatImages : language[u.language].disableChatImages);
			break;
			case 'kill':
			case 'shutdown':
				pPP.shutDown();
			break;
		}

		// Comandos livres para seguranças
		if (u.role >= 2)
			switch(command) {
				case 'skip':
					API.moderateForceSkip();
				break;
				case 'mute':
					var mutedTime;
					if (args[2] == "45" || args[2] == "l") {
						mutedTime = "l";
					} else if (args[2] == "30" || args[2] == "m") {
						mutedTime = "m";
					} else if (args[2] == "15" || args[2] == "s") {
						mutedTime = "s";
					} else {
						addChat('error', language[u.language].cmdMute, undefined, 'chat-system');
					}

					$.get('/_/mutes', function (result) {
						if (result.data.map(function(e) { return e.id; }).indexOf(user.id) >= 0)
							$.ajax({
								type: 'DELETE',
								url: '/_/mutes/' + user.id
							});
					});

					$.ajax({
						type: 'POST',
						url: '/_/mutes',
						dataType: 'json',
						contentType: 'application/json',
						data: JSON.stringify({
							userID: user.id, 
							reason: 5, 
							duration: mutedTime
						})
					});
				break;
				case 'kick':
					var kickTime;
					if (args[2] == "day") {
						kickTime = "d";
					} else if (args[2] == "hour") {
						kickTime = "h";
					} else if (args[2] == "minute") {
						kickTime = "h";
					} else {
						addChat('error', language[u.language].cmdMute, undefined, 'chat-system');
					}

					$.ajax({
						type: 'POST',
						url: '/_/bans/add',
						dataType: 'json',
						contentType: 'application/json',
						data: JSON.stringify({
							userID: user.id, 
							reason: 5, 
							duration: kickTime
						}).done(function() {
							if (u.role >= 3 && args[2] == "minute")
								setTimeout(function() {
									$.ajax({
										type: 'DELETE',
										url: '/_/bans/' + user.id
									});
								}, 6e4);
						})
					});
				break;
				case 'add':
					$.ajax({
						type: 'POST',
						url: '/_/booth/add',
						dataType: 'json',
						contentType: 'application/json',
						data: JSON.stringify({id: user.id})
					});
				break;
				case 'remove':
					$.ajax({
						type: 'DELETE',
						url: '/_/booth/remove/' + user.id
					});
				break;
				case 'clearchat':
					var currentChat = $('#chat-messages > .cm[data-cid]');
					for (var i = 0; i < currentChat.length; i++) {
						$.ajax({
							type: 'DELETE',
							url: '/_/chat/' + currentChat[i].getAttribute('data-cid')
						})
					}
					$('#chat-messages').html('');
					API.sendChat(language[u.language].clearChat);
				break;
			}

		// Comandos livres para coordenadores
		if (u.role >= 3)
			switch(command) {
				case 'swap':
					// ...
				break;
				case 'lockskip':
					var djId = API.getDJ().id;
					API.moderateForceSkip();
					boothBetween = setInterval(function() {
						if (djId != API.getDJ().id) {
							API.moderateMoveDJ(djId, 1);
							clearInterval(boothBetween);
						}
					}, 1000);
				break;
				case 'unmute':
					$.ajax({
						type: 'DELETE',
						url: '/_/mutes/' + user.id
					});
				break;
				case 'ban':
					$.ajax({
						type: 'POST',
						url: '/_/bans/add',
						dataType: 'json',
						contentType: 'application/json',
						data: JSON.stringify({
							userID: user.id, 
							reason: 5, 
							duration: "f"
						})
					});
				break;
				case 'promote':
					var roleId;
					if (args[2] == "1" || args[2] == "residentdj")
						roleId = 1;
					if (args[2] == "2" || args[2] == "bouncer")
						roleId = 2;
					if (u.role >= 4 && (args[2] == "3" || args[2] == "manager"))
						roleId = 3;
					if (u.role == 5 && (args[2] == "4" || args[2] == "cohost"))
						roleId = 4;
					if (u.role == 5 && (args[2] == "5" || args[2] == "host"))
						roleId = 5;

					if (roleId >= 1 && roleId <= 5) {
						$.ajax({
							type: 'POST',
							url: '/_/staff/update',
							dataType: 'json',
							contentType: 'application/json',
							data: JSON.stringify({userID: user.id, roleID: roleId})
						});
					} else {
						addChat('error', language[u.language].cmdPromote, undefined, 'chat-system');
					}
				break;
				case 'demote':
					$.ajax({
						type: 'DELETE',
						url: '/_/staff/' + user.id
					});
				break;
				case 'move':
					API.moderateMoveDJ(user.id, args[2]);
				break;
			}
	
		// Comando livre para co-hosts e host
		if (u.role >= 4 && command == 'title') {
			$.ajax({
				type: 'POST',
				url: '/_/rooms/update',
				dataType: 'json',
				contentType: 'application/json',
				data: JSON.stringify({name: cmd.substr(6)})
			});
			addChat('info', language[u.language].cmdTitle + cmd.substr(6));
		}

	}
	
	/* 
	* Evento de entrada de usuário
	*/
	function eventUserJoin(user) {
		addChat('info', (user.friend ? language[u.language].uFJoin : language[u.language].uJoin), user.username, 'community-users');
	}

	/*
	* Evento de saída de usuário
	*/
	function eventUserLeave(user) {
		addChat('info', (user.friend ? language[u.language].uFLeave : language[u.language].uLeave), user.username, 'community-users');
		var voteType = user.vote;
		if (voteType != 0)
			removeVoteScoreBoard(user.id, voteType > 0 ? 'woot' : 'meh');
	}

	/* 
	* Evento de avanço de música
	*/
	function eventAdvance(user) {
		$('#yt-frame').attr('allowfullscreen','');
		scoreboard = {woot:[], grab:[], meh:[]};
		$('#vote > #scoreboard > .list').html('');
		
		if (me.settings.autoWoot)
			me.autoWoot();
		if (me.settings.autoGrab)
			me.autoGrab();
		if (me.settings.autoJoin)
			me.autoJoin();
	}

	/* 
	* Evento de votos Woot/Meh
	*/
	function eventVote(voteObj) {
		addVoteScoreBoard({id: voteObj.user.id, username: voteObj.user.username, role: voteObj.user.role}, voteObj.vote > 0 ? 'woot' : 'meh');
	}

	/* 
	* Evento de Grab
	*/
	function eventGrab(voteObj) {
		addVoteScoreBoard({id: voteObj.user.id, username: voteObj.user.username, role: voteObj.user.role}, 'grab');
	}

	/* 
	* Inicia a aplicação, carrega as configurações, eventos e UI
	*/
	function startUp() {
		saveSettings();
		loadSettings();
		loadEvents();
		loadUI();
		if (me.settings.autoWoot)
			me.autoWoot();
		if (me.settings.autoGrab)
			me.autoGrab();
		if (me.settings.autoJoin)
			me.autoJoin();
		if (me.settings.accidentalRefresh)
			me.accidentalRefresh();

		listScoreBoard();

		var $refreshbutton = $('#playback-controls > .button.refresh'),
			$ytframe = $('#yt-frame');

		$refreshbutton.click();
		setTimeout(function() {
			$ytframe.attr('allowfullscreen','');
		}, 1e3);
		$refreshbutton.on('click', function(){
			$('#yt-frame').attr('allowfullscreen','');
		});

		function etaCountdown() {
			var totalTime = (API.getWaitListPosition() + 1) * 4 * 60 + API.getTimeRemaining(),
				minutes = ((totalTime / 60) % 60) | 0,
				hours = ((totalTime / 60) / 60) | 0,
				strMinutes = (minutes < 10 ? "0" + minutes : minutes) + "m",
				strHours = "0" + hours + "h";

				return strHours + strMinutes;
		}

		setInterval(function() {
			if (API.getWaitListPosition() > 0)
				if ($('#dj-button.is-leave > .ppp-eta').length) {
					var totalTime = (API.getWaitListPosition() + 1) * 4 * 60 + API.getTimeRemaining(),
						minutes = ((totalTime / 60) % 60) | 0,
						hours = ((totalTime / 60) / 60) | 0,
						strMinutes = (minutes < 10 ? "0" + minutes : minutes) + "m",
						strHours = "0" + hours + "h";
					$('#ppp-eta-time').text(strHours + strMinutes);
				} else {
					$('#dj-button.is-leave').append('<span class="ppp-eta">ETA: <div id="ppp-eta-time">00h00</div></span>');
				}
		}, 1000);

		addChat('run', language[u.language].running + version.major + "." + version.minor + "." + version.patch + "!");
		console.log(language[u.language].running + version.major + "." + version.minor + "." + version.patch + "!");
	}
	startUp();
}

plugPlusPlus.prototype.kill = function () {
	this.shutDown();
}

plugPlusPlus.prototype.toggleAutoWoot = function() {
	this.settings.autoWoot = !this.settings.autoWoot;
	this.autoWoot();
}

plugPlusPlus.prototype.toggleAutoGrab = function() {
	this.settings.autoGrab = !this.settings.autoGrab;
	this.autoGrab();
}

plugPlusPlus.prototype.toggleAutoJoin = function() {
	this.settings.autoJoin = !this.settings.toggleAutoJoin;
	this.autoJoin();
}

plugPlusPlus.prototype.toggleAfkRespond = function() {
	this.settings.afkRespond = !this.settings.afkRespond;
}

plugPlusPlus.prototype.setAfkMessage = function(message) {
	if (!this.settings.afkRespond)
		this.settings.afkRespond = true;
	this.settings.afkMessage = message;
}

plugPlusPlus.prototype.toggleAccidentalRefresh = function() {
	this.settings.accidentalRefresh = !this.settings.accidentalRefresh;
	this.accidentalRefresh();
}

plugPlusPlus.prototype.toggleDesktopNotifications = function() {
	this.settings.desktopNotifications = !this.settings.desktopNotifications;
}

plugPlusPlus.prototype.toggleChatYoutubePreview = function() {
	this.settings.chatYoutubePreview = !this.settings.chatYoutubePreview;
}

plugPlusPlus.prototype.toggleChatImages = function() {
	this.settings.chatImages = !this.settings.chatImages;
}

plugPlusPlus.prototype.setEmotesDefault = function() {
	this.settings.emotesDefault = !this.settings.emotesDefault;
}

plugPlusPlus.prototype.setEmotesOrigem = function() {
	this.settings.emotesOrigem = !this.settings.emotesOrigem;
}

plugPlusPlus.prototype.setEmotesTwitch = function() {
	this.settings.emotesTwitch = !this.settings.emotesTwitch;
}

var pPP = new plugPlusPlus();