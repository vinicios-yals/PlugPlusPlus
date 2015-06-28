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
		this.settings = JSON.parse(localStorage.getItem('plugPlusPlus'));
	}

	// Configurações em tempo de execução
	me.settings = {
		currentUser: API.getUser(),
		autoWoot: true,
		autoGrab: false,
		autoJoin: false, 
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
		emotesTwitch: false,
		shutdown: null,
	}

	/* 
	* Carrega todos os eventos do Plug.dj
	*/
	function loadUI() {
		$('head').append('<link rel="stylesheet" type="text/css" href="https://rawgit.com/vinicios-yals/PlugPlusPlus/master/pPP.css" id="css-plugPlusPlusUI">');
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
	}

	function unloadEvents() {
		API.off(API.CHAT, eventChat);
		API.off(API.CHAT_COMMAND, eventCmd);
		API.off(API.USER_JOIN, eventUserJoin);
		API.off(API.USER_LEAVE, eventUserLeave);
		API.off(API.ADVANCE, eventAdvance);
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
				if (usersInRoom[i].username === name) {
					return usersInRoom[i];
				}
			}
		}
		return false;
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

		if ($.inArray(userId, roles.promoter) >= 0)
			messageElement.find('.from').prepend('<i class="icon icon-roles promoter"></i>');

		if ($.inArray(userId, roles.translator) >= 0)
			messageElement.find('.from').prepend('<i class="icon icon-roles translator"></i>');

		if ($.inArray(userId, roles.support) >= 0)
			messageElement.find('.from').prepend('<i class="icon icon-roles support"></i>');

		if ($.inArray(userId, roles.donator) >= 0)
			messageElement.find('.from').prepend('<i class="icon icon-roles donator"></i>');

		if ($.inArray(userId, roles.collaborator) >= 0)
			messageElement.find('.from').prepend('<i class="icon icon-roles collaborator"></i>');

		if ($.inArray(userId, roles.developer) >= 0)
			messageElement.find('.from').prepend('<i class="icon icon-roles developer"></i>');

		if ((me.settings.currentUser.role > 1 && chat.un === me.settings.currentUser.username && chat.message.substr(0, 7) === "[AFK] @") || (chat.type === "mention" && me.settings.currentUser.role > 1 && chat.message.substr(0, 7) === "[AFK] @")) {
				$.ajax({
					type: 'DELETE',
					url: '/_/chat/' + chat.cid
				});
			}, 30 * 1000);
		}

		if (chat.message == "!afkdisable" && userRole > 1) {
			if (me.settings.autoRespond == true) {
				pPP.setAutoRespond(false);
				API.sendChat("@" + chat.un + " autoRespond was disabled!");
			}
		} else if (chat.message == "!joindisable" && userRole > 1) {
			if (me.settings.autoJoin == true) {
				pPP.setAutoJoin(false);
				API.sendChat("@" + chat.un + " autoJoin was disabled!");
			}
		}

		if (chat.type === "mention" && me.settings.autoRespond && chat.uid != me.settings.currentUser.id && chat.message.substr(0, 7) != "[AFK] @") {
			API.sendChat("[AFK] @" + chat.un + " " + me.settings.respondMessage);
		}
	
		if (me.settings.currentUser.username == chat.un && userRole > 1) {
			messageElement.addClass('deletable');
			messageElement.append('<div class="delete-button" style="display: none;">Delete</div>');
			messageElement.on('mouseenter', function(){
				$(this).find('.delete-button').show();
			}).on('mouseleave', function(){
				$(this).find('.delete-button').hide();
			});
			messageElement.find('.delete-button').on('click', function(){
				API.moderateDeleteChat(chat.cid);
			});
		}

		if (userRole > 1)
			$('#chat-messages .cm[data-cid="' + chat.cid + '"]').addClass('role-staff');
	}

	/* 
	* Evento de comandos
	*/
	function eventCmd(cmd) {
		var args = cmd.split(' '),
			user = userLookUp(args[1]),
			command = args[0].substr(1).toLowerCase();
		switch (command) {
			case 'ping':
				// ...
				break;
			case 'shrug':
				API.sendChat(cmd.substr(6) + " ¯\\_(ツ)_/¯");
				break;
			case 'lenny':
				API.sendChat(cmd.substr(6) + " ( ͡° ͜ʖ ͡°)");
				break;
			case 'message':
				// idek
				break;
			case 'msg':
				// idek
				break;
			case 'skip':
				API.moderateForceSkip();
				break;
			case 'mute':
				/*var userMuted = {status: null, id: null}
		        $.get('/_/mutes', function (data) {
					for (var i = 0, data.length; i++) {
						userMuted.status = args[1] == data.data[i].username ? true : false;
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
					});*/

				switch (args[2]) {
					case '15':
					case 's':
					case 'short':
						if (me.settings.currentUser.role >= 2) {
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
					case '30':
					case 'm':
					case 'medium':
						if (me.settings.currentUser.role >= 2) {
							$.ajax({
								type: 'POST',
								url: '/_/mutes',
								dataType: 'json',
								contentType: 'application/json',
								data: JSON.stringify({
									userID: user.id, 
									reason: 1, 
									duration: "m"
								})
							});
						} else {
							addChat('error', "You don't have sufficient permissions to do this!");
						}
						break;
					case '45':
					case 'l':
					case 'long':
						if (me.settings.currentUser.role >= 2) {
							$.ajax({
								type: 'POST',
								url: '/_/mutes',
								dataType: 'json',
								contentType: 'application/json',
								data: JSON.stringify({
									userID: user.id, 
									reason: 1, 
									duration: "l"
								})
							});
						} else {
							addChat('error', "You don't have sufficient permissions to do this!");
						}
						break;
					default:
						addChat('error', "You don't have sufficient permissions to do this or you didnt specify a valid length!");
						break;
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
				switch (args[2]) {
					case 'hour':
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
						break;
					case 'day':
						$.ajax({
								type: 'POST',
								url: '/_/bans/add',
								dataType: 'json',
								contentType: 'application/json',
								data: JSON.stringify({
									userID: user.id, 
									reason: 1, 
									duration: "d"
								})
							});
						break;
					case 'minute':
						if (me.settings.currentUser.role >= 3) {
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
					default:
						addChat('error', "Check if you  specified the correct length or if you have the rank to do this!");
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
				if (me.settings.currentUser.role === 3) {
					switch (args[2]) {
						case '1':
						case 'rdj':
						case 'residentdj':
							$.ajax({
								type: 'POST',
								url: '/_/staff/update',
								dataType: 'json',
								contentType: 'application/json',
								data: JSON.stringify({userID: user.id, roleID: 1})
							});
							break;
						case '2':
						case 'bouncer':
							$.ajax({
								type: 'POST',
								url: '/_/staff/update',
								dataType: 'json',
								contentType: 'application/json',
								data: JSON.stringify({userID: user.id, roleID: 2})
							});
							break;
						default:
							addChat('error', "You must specify a role! Possible arguments are: 1, 2, rdj, residentdj or bouncer.");
							break;
					}
				} else if (me.settings.currentUser.role === 4) {
					switch (args[2]) {
						case '1':
						case 'rdj':
						case 'residentdj':
							$.ajax({
								type: 'POST',
								url: '/_/staff/update',
								dataType: 'json',
								contentType: 'application/json',
								data: JSON.stringify({userID: user.id, roleID: 1})
							});
							break;
						case '2':
						case 'bouncer':
							$.ajax({
								type: 'POST',
								url: '/_/staff/update',
								dataType: 'json',
								contentType: 'application/json',
								data: JSON.stringify({userID: user.id, roleID: 2})
							});
							break;
						case '3':
						case 'manager':
							$.ajax({
								type: 'POST',
								url: '/_/staff/update',
								dataType: 'json',
								contentType: 'application/json',
								data: JSON.stringify({userID: user.id, roleID: 3})
							});
							break;
						default:
							addChat('error', "You must specify a role! Possible arguments are: 1, 2, 3, rdj, residentdj, bouncer or manager.");
							break;
					}
				} else if (me.settings.currentUser.role === 5) {
					switch (args[2]) {
						case '1':
						case 'rdj':
						case 'residentdj':
							$.ajax({
								type: 'POST',
								url: '/_/staff/update',
								dataType: 'json',
								contentType: 'application/json',
								data: JSON.stringify({userID: user.id, roleID: 1})
							});
							break;
						case '2':
						case 'bouncer':
							$.ajax({
								type: 'POST',
								url: '/_/staff/update',
								dataType: 'json',
								contentType: 'application/json',
								data: JSON.stringify({userID: user.id, roleID: 2})
							});
							break;
						case '3':
						case 'manager':
							$.ajax({
								type: 'POST',
								url: '/_/staff/update',
								dataType: 'json',
								contentType: 'application/json',
								data: JSON.stringify({userID: user.id, roleID: 3})
							});
							break;
						case '4':
						case 'cohost':
						case 'co-host':
							$.ajax({
								type: 'POST',
								url: '/_/staff/update',
								dataType: 'json',
								contentType: 'application/json',
								data: JSON.stringify({userID: user.id, roleID: 4})
							});
							break;
						case '5':
						case 'host':
							$.ajax({
								type: 'POST',
								url: '/_/staff/update',
								dataType: 'json',
								contentType: 'application/json',
								data: JSON.stringify({userID: user.id, roleID: 5})
							});
							break;
						default:
							addChat('error', "You must specify a role! Possible arguments are: 1, 2, 3, 4, 5, rdj, residentdj, bouncer, manager, co-host, cohost or host.");
							break;
					}
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
			case 'move':
				if (me.settings.currentUser.role >= 2) {
					API.moderateMoveDJ(user.id, args[2])
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
			case 'clearchat':
				if (me.settings.currentUser.role >= 2) {
					var currentchat = $('#chat-messages > .cm[data-cid]');
						for (var i = 0; i < currentchat.length; i++) {
							if (currentchat[i].type != "moderation") {
								$.ajax({
									url: "/_/chat/" + currentchat[i].getAttribute("data-cid"),
									type: "DELETE"
								})
							}
						}
					API.sendChat("Clearing chat...");
				}
				break;
			case 'whois':
				$.get('/_/mutes', function (data) {
				    if (data !== null && typeof data !== "undefined") {
						
				    }
				});
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
			case 'autorespond':
				if (me.settings.autoRespond === false) {
					pPP.setAutoRespond(true);
					addChat('message', "Auto Respond was enabled!");
				} else {
					pPP.setAutoRespond(false);
					addChat('message', "Auto Respond was disabled!");
				}
				break;
			case 'respondmessage':
				pPP.setRespondMessage(cmd.substr(15));
				addChat('message', "Auto Respond Message set to: " + cmd.substr(15));
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
			case 'inlinevideos':
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
				break;
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
		addChat('run', 'plug++ now running ' + version.major + "." + version.minor + "." + version.patch + "!");
		console.log('plug++ now running ' + version.major + "." + version.minor + "." + version.patch + "!");
	}
	startUp();
}

plugPlusPlus.prototype.shutDown = function () {
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

plugPlusPlus.prototype.setAutoRespond = function(status) {
	this.settings.autoRespond = status;
}

plugPlusPlus.prototype.setRespondMessage = function(message) {
	this.settings.respondMessage = message;
}

plugPlusPlus.prototype.setAccidentalRefresh = function(status) {
	this.settings.accidentalRefresh = status;
	this.accidentalRefresh();}

plugPlusPlus.prototype.setVideoInFullScreen = function(status) {
	this.settings.videoInFullScreen = status;
}

plugPlusPlus.prototype.setDesktopNotifications = function(status) {
	this.settings.desktopNotifications = status;
}

plugPlusPlus.prototype.setFullscreenVideo = function(status) {
	this.settings.fullscreenVideo = status;
	saveSettings();
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