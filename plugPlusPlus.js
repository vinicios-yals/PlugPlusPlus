var plugPlusPlus = function plugPlusPlus() {

	var u = API.getUser(),
		me = this,
		version = {
			major: '3',
			minor: '0',
			patch: '0'
		},
		language: {
			en: {
				afkMessage: 'Sorry, but I am not available right now.',
				cmdMute: 'You must specify a time! Possible arguments are:<br />15 minutes: s or 15<br />30 minutes: m or 30<br />45 minutes: l or 45',
				cmdPromote: 'You must specify! Possible arguments are:<br />Resident Dj: 1 or residentdj<br />Bouncer: 2 or bouncer<br />Manager: 3 or manager<br />CO-Host: 4 or cohost<br />Host: 5 or host',
				cmdTitle: 'Community name set to: '
			},
			pt: {
				afkMessage: 'Desculpe, mas não estou disponível neste momento.',
				cmdMute: 'Seja mais especifico! Os argumentos possíveis são:<br />15 minutos: s ou 15<br />30 minutos: m ou 30<br />45 minutos: l ou 45',
				cmdPromote: 'Seja mais especifico! Os argumentos possíveis são:<br />DJ Residente: 1 ou residentdj<br />Segurança: 2 ou bouncer<br />Coordenador: 3 ou manager<br />CO-Host: 4 ou cohost<br />Host: 5 ou host',
				cmdTitle: 'Nome da comunidade definido para: '
			}
		};

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
		$('head').append('<link rel="stylesheet" type="text/css" href="https://rawgit.com/vinicios-yals/PlugPlusPlus/master/plugPlusPlus.min.css" id="css-plugPlusPlusUI">');
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
			chat.append('<div class="cm moderation plugPlusPlus-message pPP-' + type + '"><div class="badge-box"><i class="icon icon-star-white"></i></div><div class="msg"><div class="from"><span class="app-name">plug<span class="plusplus">++</span></span><span class="timestamp" style="display: inline;">' + f + '</span></div><div class="text">' + m + '</div></div></div>');
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
		window.onbeforeunload = me.settings.accidentalRefresh ? function() { return "Talvez você tenha clicado sem querer aí!"; } : null;
	}

	/* 
	* Evento do chat
	*/
	function eventChat(chat) {
		var userId = Number((chat.cid).split('-')[0]),
			userRole = API.getUser(userId).role,
			messageElement = $('#chat-messages .cm[data-cid="' + chat.cid + '"]');

		$.get('https://rawgit.com/vinicios-yals/PlugPlusPlus/master/roles.json', function (result) {
			if (result[data].map(function(e) { return e.id; }).indexOf(user.id) >= 0)
				$.ajax({
					type: 'DELETE',
					url: '/_/mutes/' + user.id
				});
		});

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
		if (userRole > 1)
			messageElement.addClass('role-staff');

		// Deleta mensagens de afks (esse script só é executado caso você seja um segurança+)
		if (u.role > 1 && chat.message.substr(0, 7) === "[AFK] @")
			setTimeout(function() {
				$.ajax({
					type: 'DELETE',
					url: '/_/chat/' + chat.cid
				});
			}, 30 * 1000);

		// Abre midias no chat
		/*if (me.settings.chatImages)
			messageElement.find('.msg').find('.text > a').each(function() {
				var $link = $(this),
					link = $link.attr('href'),
					linkSplit = link.split('.'),
					linkExt = linkSplit[linkSplit.length - 1];

				if (linkExt == 'jpg' || linkExt == 'png' || linkExt == 'gif') {
					$link.html('<img src="' + link + '" class="media-inline">');
				} else if(link.indexOf('youtu') > 0) { // Não funciona
					$link.after('<iframe height="200" src="' + link + '" class="media-inline" frameborder="0" allowfullscreen></iframe>');
					$link.remove();
				}
			});*/

		// Desabilita o afk respond e o auto join (esse script só é ativo se a sala não permitir os mesmos)
		if (chat.message == "!afkdisable" && userRole > 1) {
			if (me.settings.afkRespond == true) {
				pPP.setAfkRespond(false);
				API.sendChat("@" + chat.un + " afkRespond was disabled!");
			}
		} else if (chat.message == "!joindisable" && userRole > 1) {
			if (me.settings.autoJoin == true) {
				pPP.setAutoJoin(false);
				API.sendChat("@" + chat.un + " autoJoin was disabled!");
			}
		}

		// Responde quando está afk
		if (chat.type === "mention" && me.settings.afkRespond && chat.uid != u.id && chat.message.substr(0, 7) != "[AFK] @")
			API.sendChat("[AFK] @" + chat.un + " " + me.settings.afkMessage);
	
		// Habilita o self-delete
		if (u.username == chat.un && userRole > 1) {
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
				API.sendChat(cmd.substr(6) + " (⊃｡•́‿•̀｡)⊃━☆ﾟ.*･｡ﾟ");
			break;
			case 'wat':
				API.sendChat(cmd.substr(4) + " ʕ ͠° ʖ̫ °͠ ʔ");
			break;
			case 'whatever':
				API.sendChat(cmd.substr(9) + " ¯\_(⊙_ʖ⊙)_/¯");
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
					addChat('error', "User not found.");
				}
			break;
			case 'autowoot':
				pPP.toggleAutoWoot();
				addChat('message', me.settings.autoWoot ? language[u.language].enableAutoWoot : language[u.language].disableAutoWoot);
			break;
			case 'autograb':
				pPP.toggleAutoWoot();
				addChat('message', me.settings.autoWoot ? language[u.language].enableAutoWoot : language[u.language].disableAutoWoot);
				if (me.settings.autoGrab === false) {
					pPP.setAutoGrab(true);
					addChat('message', "AutoGrab was enabled!");
				} else {
					pPP.setAutoGrab(false);
					addChat('message', "AutoGrab was disabled!");
				}
			break;
			case 'autojoin':
				pPP.toggleAutoWoot();
				addChat('message', me.settings.autoWoot ? language[u.language].enableAutoWoot : language[u.language].disableAutoWoot);
				if (me.settings.autoJoin === false) {
					pPP.setAutoJoin(true);
					addChat('message', "AutoJoin was enabled!");
				} else {
					pPP.setAutoJoin(false);
					addChat('message', "AutoJoin was disabled!");
				}
			break;
			case 'afkrespond':
				pPP.toggleAutoWoot();
				addChat('message', me.settings.autoWoot ? language[u.language].enableAutoWoot : language[u.language].disableAutoWoot);
				if (me.settings.afkRespond === false) {
					pPP.setAfkRespond(true);
					addChat('message', "AFK Respond was enabled!");
				} else {
					pPP.setAfkRespond(false);
					addChat('message', "AFK Respond was disabled!");
				}
			break;
			case 'afkmessage':
				pPP.setAfkMessage(cmd.substr(11));
				addChat('message', "AFK Respond Message set to: " + cmd.substr(11));
				saveSettings();
			break;
			case 'accidentalrefresh':
				if (me.settings.accidentalRefresh === false) {
					pPP.setAccidentalRefresh(true);
					addChat('message', "Accidental Refresh Protection was enabled!");
				} else {
					pPP.setAccidentalRefresh(false);
					addChat('message', "Accidental Refresh Protection was disabled!");
				}
			break;
			case 'fullscreen':
				if (me.settings.videoInFullScreen === false) {
					pPP.setVideoInFullScreen(true);
					addChat('message', "Fullscreen Video was enabled!");
				} else {
					pPP.setVideoInFullScreen(false);
					addChat('message', "Fullscreen Video was disabled!");
				}
			break;
			/*case 'inlinevideos':
			case 'chatvideos':
				if (me.settings.chatYoutubePreview === false) {
					pPP.setChatYoutubePreview(true);
					addChat('message', "Inline Videos were enabled!");
				} else {
					pPP.setChatYoutubePreview(false);
					addChat('message', "Inline Videos were disabled!");
				}
			break;
			case 'inlineimages':
			case 'chatimages':
				if (me.settings.chatImages === false) {
					pPP.setChatImages(true);
					addChat('message', "Inline Images were enabled!");
				} else {
					pPP.setChatImages(false);
					addChat('message', "Inline Images were disabled!");
				}
			break;*/
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
					if (args[2] == "45" || args[2] == "l" || args[2] == "long") {
						mutedTime = "l";
					} else if (args[2] == "30" || args[2] == "m" || args[2] == "medium") {
						mutedTime = "m";
					} else if (args[2] == "30" || args[2] == "m" || args[2] == "medium") {
						mutedTime = "s";
					} else {
						addChat('error', language[u.language].cmdMute);
					}

					$.get('/_/mutes', function (result) {
						if (result[data].map(function(e) { return e.id; }).indexOf(user.id) >= 0)
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
					} else {
						kickTime = "h";
					}

					$.ajax({
						type: 'POST',
						url: '/_/bans/add',
						dataType: 'json',
						contentType: 'application/json',
						data: JSON.stringify({
							userID: user.id, 
							reason: 1, 
							duration: "h"
						}).done(function() {
							if (u.role >= 3 && args[2] == "minute")
								setTimeout(function(){
									$.ajax({
										type: 'DELETE',
										url: '/_/bans/' + user.id
									});
								}, 6e4);
						});
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
					setTimeout(function(){
						API.sendChat(language[u.language].clearChat);
					}, 3e3);
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
					API.moderateMoveDJ(djId, 1);
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
							reason: 1, 
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

					$.ajax({
						type: 'POST',
						url: '/_/staff/update',
						dataType: 'json',
						contentType: 'application/json',
						data: JSON.stringify({userID: user.id, roleID: roleId})
					});

					if ((args[2] != "1" || args[2] != "residentdj") ||
						(args[2] != "2" || args[2] != "bouncer") ||
						(args[2] != "3" || args[2] != "manager") ||
						(args[2] != "4" || args[2] != "cohost") ||
						(args[2] != "5" || args[2] != "host"))
						addChat('error', language[u.language].cmdPromote);
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
				data: {name: cmd.substr(6)}
			});
			addChat('info', language[u.language].cmdTitle + cmd.substr(6));
		}

	}
	
	/* 
	* Evento de entrada de usuário
	*/
	function eventUserJoin(user) {}

	/* 
	* Evento de saída de usuário
	*/
	function eventUserLeave(user) {
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
		$('#vote > #scoreboard > .list > div').remove();
		
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
		$ytframe.attr('allowfullscreen','');
		$refreshbutton.on('click', function(){
			$ytframe.attr('allowfullscreen','');
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

		addChat('run', 'Now running ' + version.major + "." + version.minor + "." + version.patch + "!");
		console.log('Now running ' + version.major + "." + version.minor + "." + version.patch + "!");
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

plugPlusPlus.prototype.setDesktopNotifications = function() {
	this.settings.desktopNotifications = !this.settings.desktopNotifications;
}

plugPlusPlus.prototype.setChatYoutubePreview = function() {
	this.settings.chatYoutubePreview = !this.settings.chatYoutubePreview;
}

plugPlusPlus.prototype.setChatImages = function() {
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