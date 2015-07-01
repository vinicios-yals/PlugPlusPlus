var plugPlusPlus = function plugPlusPlus() {

	var me = this,
		version = {
			major: "2",
			minor: "3",
			patch: "0"
		}, roles;

	$.get('https://rawgit.com/vinicios-yals/PlugPlusPlus/master/roles.json', function(result) {
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
		currentUser: API.getUser(),
		autoWoot: true,
		autoGrab: false,
		autoJoin: false, 
		afkRespond: false,
		afkMessage: "Sorry, but I am not available right now.",
		accidentalRefresh: true,
		desktopNotifications: false,
		privateMessages: false,
		chatYoutubePreview: false,
		chatImages: true,
		emotesDefault: true,
		emotesOrigem: false,
		emotesTwitch: false,
		shutdown: null,
	}

	/* 
	* Carrega todos os eventos do plug.dj
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

	function unloadUI() {
		$('#css-plugPlusPlusUI').remove();
		$('body').prepend('#plugPlusPlusUI');
	}
	
	function loadEvents() {
		API.on(API.CHAT, eventChat);
		API.on(API.CHAT_COMMAND, eventCmd);
		API.on(API.USER_JOIN, eventUserJoin);
		API.on(API.USER_LEAVE, eventUserLeave);
		API.on(API.ADVANCE, eventAdvance);
		API.on(API.VOTE_UPDATE, eventVote);
		API.on(API.GRAB_UPDATE, eventVote);
	}

	function unloadEvents() {
		API.off(API.CHAT, eventChat);
		API.off(API.CHAT_COMMAND, eventCmd);
		API.off(API.USER_JOIN, eventUserJoin);
		API.off(API.USER_LEAVE, eventUserLeave);
		API.off(API.ADVANCE, eventAdvance);
		API.off(API.VOTE_UPDATE, eventVote);
		API.off(API.GRAB_UPDATE, eventGrab);
	}

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

	var scoreboard = {
			woot: [],
			grab: [],
			meh: []
		};

	function listScoreBoard() {
		/*var users = API.getUsers(),
			$scoreboard = $('.');
		for (var i = 0; i < users.length; i++) {
			if (users[i].vote > 0) {
				scoreboard.woot.push({id: users[i].id, username: users[i].username});
				$scoreboard.find('.list-woot').attr('id', 'uid-' + users[i].id);
			}
			if (users[i].grab) {
				scoreboard.grab.push({id: users[i].id, username: users[i].username});
				$scoreboard.find('.list-grab').attr('id', 'uid-' + users[i].id);
			}
			if (users[i].meh < 0) {
				scoreboard.meh.push({id: users[i].id, username: users[i].username});
				$scoreboard.find('.list-meh').attr('id', 'uid-' + users[i].id);
			}
		}*/
	}

	/* 
	* Desligar, descarregar e remover
	*/
	me.shutDown = function() {
		saveSettings();
		unloadUI();
		unloadEvents();
		addChat('run', 'plug++ shutting down..');
		pPP = undefined;
		console.log('plug++ shutting down..');
	}

	/* 
	* Da woot na mídia
	*/
	me.autoWoot = function() {
		if (me.settings.autoWoot && API.getDJ().id !== me.settings.currentUser.id && !$('#woot').hasClass('selected'))
			$('#woot').click();
	}

	/* 
	* Adiciona a mídia a playlist selecionada
	*/
	me.autoGrab = function() {
		if (me.settings.autoGrab && API.getDJ().id !== me.settings.currentUser.id) {
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
		if (me.settings.autoJoin && !$('#dj-button').hasClass('is-locked') && API.getWaitListPosition() == -1 && API.getDJ().id !== me.settings.currentUser.id)
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

		// Deleta mensagens de afks (esse script só é executado caso você seja um segurança+)
		if (me.settings.currentUser.role > 1 && chat.message.substr(0, 7) === "[AFK] @")
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
		if (chat.type === "mention" && me.settings.afkRespond && chat.uid != me.settings.currentUser.id && chat.message.substr(0, 7) != "[AFK] @")
			API.sendChat("[AFK] @" + chat.un + " " + me.settings.afkMessage);
	
		// Habilita o self-delete
		if (me.settings.currentUser.username == chat.un && userRole > 1) {
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

		// Marca se a mensagem é da equipe
		if (userRole > 1)
			messageElement.addClass('role-staff');

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
				API.sendChat(cmd.substr(5) + " ლ(ಠ▃ಠლ)");
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
			/* END EMOTICONS */
			case 'skip':
				if (me.settings.currentUser.role >= 2) {
					API.moderateForceSkip();
				} else {
					addChat('error', "You don't have sufficient permissions to do this!");
				}
				break;
			case 'lockskip':
				if (me.settings.currentUser.role >= 3) {
					var djId = API.getDJ().id;
					API.moderateForceSkip();
					API.moderateMoveDJ(djId, 1);
				} else {
					addChat('error', "You don't have sufficient permissions to do this!");
				}
				break;
			case 'mute':
				if (me.settings.currentUser.role >= 2) {
					var userMuted = {status: null, id: null};
					$.get('/_/mutes', function (data) {
						for (var i = 0; data.length; i++) {
							userMuted.status = (args[1] == data.data[i].username) ? true : false;
							userMuted.id = data.data[i].id;
						}
					});

					if (userMuted.status)
						$.ajax({
							type: 'DELETE',
							url: '/_/mutes/' + userMuted.id,
							dataType: 'json',
							contentType: 'application/json',
							data: null
						});

					var mutedTime;
					if (args[2] == "45" || args[2] == "l" || args[2] == "long") {
						mutedTime = "l";
					} else if (args[2] == "30" || args[2] == "m" || args[2] == "medium") {
						mutedTime = "m";
					} else {
						mutedTime = "s";
					}

					$.ajax({
						type: 'POST',
						url: '/_/mutes',
						dataType: 'json',
						contentType: 'application/json',
						data: JSON.stringify({
							userID: user.id, 
							reason: 1, 
							duration: "s"
						})
					});
				} else {
					addChat('error', "You don't have sufficient permissions to do this!");
				}
				break;
			case 'unmute':
				if (me.settings.currentUser.role >= 3) {
					$.ajax({
						type: 'DELETE',
						url: '/_/mutes/' + user.id,
						dataType: 'json',
						contentType: 'application/json',
						data: null
					});
				} else {
					addChat('error', "You don't have sufficient permissions to do this!");
				}
				break;
			case 'kick':
				if (me.settings.currentUser.role >= 3) {
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
						})
					});
					if (args[2] == "minute")
						setTimeout(function(){
							$.ajax({
								type: 'DELETE',
								url: '/_/bans/' + user.id,
								dataType: 'json',
								contentType: 'application/json',
								data: null,
							});
						}, 6e4);
				} else {
					addChat('error', "You don't have sufficient permissions to do this!");
				}
				break;
			case 'ban':
				if (me.settings.currentUser.role >= 3) {
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
				} else {
					addChat('error', "You don't have sufficient permissions to do this!");
				}
				break;
			case 'promote':
				var roleId;
				if (me.settings.currentUser.role >= 3) {
					if (args[2] == "1" || args[2] == "residentdj")
						roleId = 1;
					if (args[2] == "2" || args[2] == "bouncer")
						roleId = 2;
					if (me.settings.currentUser.role >= 4 && (args[2] == "3" || args[2] == "manager"))
						roleId = 3;
					if (me.settings.currentUser.role == 5 && (args[2] == "4" || args[2] == "cohost"))
						roleId = 4;
					if (me.settings.currentUser.role == 5 && (args[2] == "5" || args[2] == "host"))
						roleId = 5;

					$.ajax({
						type: 'POST',
						url: '/_/staff/update',
						dataType: 'json',
						contentType: 'application/json',
						data: JSON.stringify({userID: user.id, roleID: roleId})
					});

					if (args[2] != "1" || args[2] != "residentdj" ||
						args[2] != "2" || args[2] != "bouncer" ||
						args[2] != "3" || args[2] != "manager" ||
						args[2] != "4" || args[2] != "cohost" ||
						args[2] != "3" || args[2] != "manager")
						addChat('error', "You must specify a role! Possible arguments are: 1, 2, 3, 4, 5 or residentdj, bouncer, manager, cohost, host.");

				} else {
					addChat('error', "You don't have sufficient permissions to do this!");
				}
				break;
			case 'demote':
				if (me.settings.currentUser.role >= 3) {
					$.ajax({
						type: 'DELETE',
						url: '/_/staff/' + user.id,
						dataType: 'json',
						contentType: 'application/json',
						data: null
					});
				} else {
					addChat('error', "You don't have sufficient permissions to do this!");
				}
				break;
			case 'add':
				if (me.settings.currentUser.role >= 2) {
					$.ajax({
						type: 'POST',
						url: '/_/booth/add',
						dataType: 'json',
						contentType: 'application/json',
						data: JSON.stringify({id: user.id})
					});
				} else {
					addChat('error', "You don't have sufficient permissions to do this!");
				} 
				break;
			case 'remove':
				if (me.settings.currentUser.role >= 2) {
					$.ajax({
						type: 'DELETE',
						url: '/_/booth/remove/' + user.id,
						dataType: 'json',
						contentType: 'application/json',
						data: null
					});
				} else {
					addChat('error', "You don't have sufficient permissions to do this!");
				} 
				break;
			case 'move':
				if (me.settings.currentUser.role >= 3) {
					API.moderateMoveDJ(user.id, args[2])
				} else {
					addChat('error', "You don't have sufficient permissions to do this!");
				} 
				break;
			case 'clearchat':
				if (me.settings.currentUser.role >= 3) {
					var currentchat = $('#chat-messages > .cm[data-cid]');
						for (var i = 0; i < currentchat.length; i++) {
							if (currentchat[i].type != "moderation") {
								$.ajax({
									url: "/_/chat/" + currentchat[i].getAttribute("data-cid"),
									type: "DELETE"
								})
							}
						}
					$('#chat-messages').html('');
					API.sendChat("Clearing chat...");
				}
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
				if (me.settings.autoWoot === false) {
					pPP.setAutoWoot(true);
					addChat('message', "AutoWoot was enabled!");
				} else {
					pPP.setAutoWoot(false);
					addChat('message', "AutoWoot was disabled!");
				}
				break;
			case 'autograb':
				if (me.settings.autoGrab === false) {
					pPP.setAutoGrab(true);
					addChat('message', "AutoGrab was enabled!");
				} else {
					pPP.setAutoGrab(false);
					addChat('message', "AutoGrab was disabled!");
				}
				break;
			case 'autojoin':
				if (me.settings.autoJoin === false) {
					pPP.setAutoJoin(true);
					addChat('message', "AutoJoin was enabled!");
				} else {
					pPP.setAutoJoin(false);
					addChat('message', "AutoJoin was disabled!");
				}
				break;
			case 'afkrespond':
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
			default:
				console.log('Invalid Command: /' + command);
			break;
		}
	}
	
	/* 
	* Evento de entrada de usuário
	*/
	function eventUserJoin(user) {}

	/* 
	* Evento de saída de usuário
	*/
	function eventUserLeave(user) {}


	/* 
	* Evento de avanço de música
	*/
	function eventAdvance(user) {
		if (me.settings.autoWoot)
			me.autoWoot();
		if (me.settings.autoGrab)
			me.autoGrab();
		if (me.settings.autoJoin)
			me.autoJoin();

		$('#yt-frame').attr('allowfullscreen','');
	}

	/* 
	* Evento de votos Woot/Meh
	*/
	function eventVote(obj) {
		/*if (users[i].vote > 0) {
			scoreboard.woot.push({id: users[i].id, username: users[i].username});
			$scoreboard.find('.list-woot').attr('id', 'uid-' + users[i].id);
		}
		if (users[i].grab) {
			scoreboard.grab.push({id: users[i].id, username: users[i].username});
			$scoreboard.find('.list-grab').attr('id', 'uid-' + users[i].id);
		}
		if (users[i].meh < 0) {
			scoreboard.meh.push({id: users[i].id, username: users[i].username});
			$scoreboard.find('.list-meh').attr('id', 'uid-' + users[i].id);
		}*/
	}

	/* 
	* Evento de Grab
	*/
	function eventGrab(obj) {

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

		addChat('run', 'plug++ now running ' + version.major + "." + version.minor + "." + version.patch + "!");
		console.log('plug++ now running ' + version.major + "." + version.minor + "." + version.patch + "!");
	}
	startUp();
}

plugPlusPlus.prototype.shutDown = function () {
	this.shutDown();
}

plugPlusPlus.prototype.kill = function () {
	this.shutDown();
}

plugPlusPlus.prototype.setAutoWoot = function(status) {
	this.settings.autoWoot = status;
	this.autoWoot();
}

plugPlusPlus.prototype.setAutoGrab = function(status) {
	this.settings.autoGrab = status;
	this.autoGrab();
}

plugPlusPlus.prototype.setAutoJoin = function(status) {
	this.settings.autoJoin = status;
	this.autoJoin();
}

plugPlusPlus.prototype.setAfkRespond = function(status) {
	this.settings.afkRespond = status;
}

plugPlusPlus.prototype.setAfkMessage = function(message) {
	this.settings.afkMessage = message;
}

plugPlusPlus.prototype.setAccidentalRefresh = function(status) {
	this.settings.accidentalRefresh = status;
	this.accidentalRefresh();
}

plugPlusPlus.prototype.setDesktopNotifications = function(status) {
	this.settings.desktopNotifications = status;
}

plugPlusPlus.prototype.setChatYoutubePreview = function(status) {
	this.settings.chatYoutubePreview = status;
}

plugPlusPlus.prototype.setChatImages = function(status) {
	this.settings.chatImages = status;
}

plugPlusPlus.prototype.setEmotesDefault = function(status) {
	this.settings.emotesDefault = status;
}

plugPlusPlus.prototype.setEmotesOrigem = function(status) {
	this.settings.emotesOrigem = status;
}

plugPlusPlus.prototype.setEmotesTwitch = function(status) {
	this.settings.emotesTwitch = status;
}

var pPP = new plugPlusPlus();