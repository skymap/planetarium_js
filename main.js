/**
 * 初期関数
 */
window.onload = function()
{
	var i, len;

	document.getElementById("input").style.display="none";
	changeRotationTime();
	changeRealTimeCheckbox();
	document.form.horizon_checkbox.checked = g_horizon_flag;
	document.form.az_font_checkbox.checked = g_az_font_flag;
	document.form.drawn_time_checkbox.checked = g_drawn_time_flag;
	document.form.az_line_checkbox.checked = g_az_line_flag;
	document.form.alt_line_checkbox.checked = g_alt_line_flag;
	document.form.constellation_line_checkbox.checked = g_constellation_line_flag;
	document.form.constellation_name_checkbox.checked = g_constellation_name_flag;
	document.form.planet_name_checkbox.checked = g_planet_name_flag;

	if(g_location[2] < 0)
	{
		document.form.phi_sign[0].checked = false;
		document.form.phi_sign[1].checked = true;
	}
	else
	{
		document.form.phi_sign[0].checked = true;
		document.form.phi_sign[1].checked = false;
	}

	if(g_location[6] < 0)
	{
		document.form.lam_sign[0].checked = false;
		document.form.lam_sign[1].checked = true;
	}
	else
	{
		document.form.lam_sign[0].checked = true;
		document.form.lam_sign[1].checked = false;
	}

	document.form.phi_d.value = g_location[3];
	document.form.phi_m.value = g_location[4];
	document.form.phi_s.value = g_location[5];
	document.form.lam_d.value = g_location[7];
	document.form.lam_m.value = g_location[8];
	document.form.lam_s.value = g_location[9];

	var select = document.form.timezone_elements;

	if(select.options.length < 1)
	{
		var i;

		for(i = 0; i < TIMEZONE.length; i++)
		{
			select.options[i] = new Option(TIMEZONE[i][0], i);
		}
	}

	select = document.form.magnitude_elements;

	if(select.options.length < 1)
	{
		var i;

		for(i = 0; i < INTERVAL_LIST.length; i++)
		{
			select.options[i] = new Option((i + 1) + "等級未満", i);
		}
	}

	document.form.magnitude_elements[3].selected = true;
	getTimeZone();
	getTimeNow();
	setTime();
	setLatitude();
	setLongitude();
	updateTime();

	len = g_planet.length;

	for(i = 0; i < len; i++)
	{
		document.form.planet_checkbox[i].checked = g_planet[i][0];
		getPlanet(g_time[3], i);
	}

	setCanvasSize();
	drawCanvas();
};

window.onresize = function()
{
	if(g_drawn_flag)
	{
		g_drawn_flag = false;
		setCanvasSize();
		drawCanvas();
	}
};

window.onkeydown = function(event)
{
	var keyEvent = event || window.event;
	var key = keyEvent.keyCode;

	switch(key)
	{
		case 81: // [q] 強制終了
		quit();
		break;
	}
}

function showMenu()
{
	if(g_show_menu_flag)
	{
		g_show_menu_flag = false;
		document.getElementById("input").style.display="none";
	}
	else
	{
		g_show_menu_flag = true;
		document.getElementById("input").style.display="block";
	}
}

function changeCheckbox(id)
{
	switch(id)
	{
		case 1:
		g_horizon_flag = document.form.horizon_checkbox.checked;
		break;

		case 2:
		g_az_font_flag = document.form.az_font_checkbox.checked;
		break;

		case 3:
		g_drawn_time_flag = document.form.drawn_time_checkbox.checked;
		break;

		case 4:
		g_az_line_flag = document.form.az_line_checkbox.checked;
		break;

		case 5:
		g_alt_line_flag = document.form.alt_line_checkbox.checked;
		break;

		case 6:
		g_constellation_line_flag = document.form.constellation_line_checkbox.checked;
		break;

		case 7:
		g_constellation_name_flag = document.form.constellation_name_checkbox.checked;
		break;

		case 8:
		g_planet_name_flag = document.form.planet_name_checkbox.checked;
		break;
	}

	drawCanvas();
}

function changeRealTimeCheckbox()
{
	var flag = document.button.realtime_checkbox.checked;
	stop();

	if(flag)
	{
		document.button.rotation_start_button.disabled = true;
		document.button.rotation_stop_button.disabled = true;
		document.button.rotation_forward_button.disabled = true;
		document.button.rotation_back_button.disabled = true;
		updateTimerRealTime();
		startRealTime();
	}
	else
	{
		document.button.rotation_start_button.disabled = false;
		document.button.rotation_stop_button.disabled = false;
		document.button.rotation_forward_button.disabled = false;
		document.button.rotation_back_button.disabled = false;
	}
}

function changeRotationTime()
{
	document.button.rotation_start_button.value = "Rotation (" + g_rotation_speed[g_time[12]] / 60000 + "min)";
}

function changePlanetCheckbox(id)
{
	g_planet[id][0] = document.form.planet_checkbox[id].checked;
	getPlanet(g_time[3], id);
	drawCanvas();
}

function setCanvasSize()
{
	var d = document.documentElement;
	var width = d.clientWidth;
	var height = d.clientHeight;
	var canvas = document.getElementById("screen");
	canvas.setAttribute("width", width);
	canvas.setAttribute("height", height);
	window_width = width;
	window_height = height;

	if(!canvas || !canvas.getContext)
	{
		alert("init error!");
		return false;
	}

	c = canvas.getContext('2d');
}

function quit()
{
	location.href = "http://hoshizora.yokochou.com/";
}

/**
 * 時間を設定する
 */
function setTime()
{
	var ret = false;
	var flag = new Array(6);
	var value = new Array(6);
	var res;

	res = checkParameter(document.form.year.value);
	flag[0] = res[0];
	value[0] = res[1];
	res = checkParameter(document.form.month.value);
	flag[1] = res[0];
	value[1] = res[1];
	res = checkParameter(document.form.date.value);
	flag[2] = res[0];
	value[2] = res[1];
	res = checkParameter(document.form.hour.value);
	flag[3] = res[0];
	value[3] = res[1];
	res = checkParameter(document.form.minute.value);
	flag[4] = res[0];
	value[4] = res[1];
	res = checkParameter(document.form.second.value);
	flag[5] = res[0];
	value[5] = res[1];

	if(flag[0] && flag[1] && flag[2] && flag[3] && flag[4] && flag[5])
	{
		if(value[0] < 1582)
		{
			value[0] = 1582;
			document.form.year.value = value[0];
		}

		if(value[1] < 1)
		{
			value[1] = 1;
			document.form.month.value = value[1];
		}
		else if(value[1] > 12)
		{
			value[1] = 12;
			document.form.month.value = value[1];
		}
		else if(value[0] == 1582 && value[1] < 10)
		{
			value[1] = 10;
			document.form.month.value = value[1];
		}

		if(value[2] < 1)
		{
			value[2] = 1;
			document.form.date.value = value[2];
		}
		else if(value[0] == 1582 && value[1] == 10 && value[2] < 15)
		{
			value[2] = 15;
			document.form.date.value = value[2];
		}
		else if((value[1] == 1 || value[1] == 3 || value[1] == 5 || value[1] == 7 || value[1] == 8 || value[1] == 10 || value[1] == 12) && value[2] > 31)
		{
			value[2] = 31;
			document.form.date.value = value[2];
		}
		else if((value[1] == 4 || value[1] == 6 || value[1] == 9 || value[1] == 11) && value[2] > 30)
		{
			value[2] = 30;
			document.form.date.value = value[2];
		}
		else if(value[1] == 2 && value[2] > 29)
		{
			// うるう年のとき
			if((value[0] % 4 == 0 && value[0] % 100 != 0) || value[0] % 400 == 0)
			{
				value[2] = 29;
			}
			else
			{
				value[2] = 28;
			}

			document.form.date.value = value[2];
		}

		if(value[3] > 23)
		{
			value[3] = 23;
			document.form.hour.value = value[3];
		}
		else if(value[3] < 0)
		{
			value[3] = 0;
			document.form.hour.value = value[3];
		}

		if(value[4] > 59)
		{
			value[4] = 59;
			document.form.minute.value = value[4];
		}

		if(value[5] > 59)
		{
			value[5] = 59;
			document.form.second.value = value[5];
		}

		g_time[4] = value[0];
		g_time[5] = value[1];
		g_time[6] = value[2];
		g_time[7] = value[3];
		g_time[8] = value[4];
		g_time[9] = value[5];
		var d = new Date(value[0], value[1] - 1, value[2], value[3], value[4], value[5], 0);
		g_time[11] = d.getTime();

		// 世界時を求める
		g_time[2] = value[3] - TIMEZONE[g_time[10]][1];
		ret = true;
	}

	return ret;
}

function getTimeNow()
{
	var d = new Date();
	document.form.year.value = d.getFullYear();
	document.form.month.value = d.getMonth() + 1;
	document.form.date.value = d.getDate();
	document.form.hour.value = d.getHours();
	document.form.minute.value = d.getMinutes();
	document.form.second.value = d.getSeconds();
}

/**
 * タイムゾーンを取得する
 */
function getTimeZone()
{
	var d, delta, i;

	g_time[10] = 24;
	document.form.timezone_elements[g_time[10]].selected = true;
	d = new Date();
	delta = d.getHours() - d.getUTCHours() + (d.getMinutes() - d.getUTCMinutes()) / 60;

	if(delta < -12)
	{
		delta += 24;
	}
	else if(delta > 14)
	{
		delta -= 24;
	}

	for(i = 0; i < TIMEZONE.length; i++)
	{
		if(delta == TIMEZONE[i][1])
		{
			g_time[10] = i;
			document.form.timezone_elements[i].selected = true;
			break;
		}
	}
}

/**
 * タイムゾーンが変更された
 */
function changeTimeZone()
{
	g_time[10] = document.form.timezone_elements.selectedIndex;
}

/**
 * 表示等級が変更された
 */
function changeStarMagnitude()
{
	g_show_star_len = document.form.magnitude_elements.selectedIndex + 1;
	drawCanvas();

	if(timer != null && !document.button.realtime_checkbox.checked)
	{
		g_timer_interval = INTERVAL_LIST[g_show_star_len - 1];
		stop();
		start();
	}
}

function pressedTimeNowButton()
{
	getTimeNow();
	getTimeZone();
}

function updateTime()
{
	var i, len;

	g_time[3] = calculateJulianDay(g_time[4], g_time[5], g_time[6], g_time[2], g_time[8], g_time[9]);
	g_time[1] = calculateGST2000(g_time[3]);
	g_time[2] = g_time[2] + g_time[8] / 60 + g_time[9] / 3600;
	g_time[0] = calculateST(g_time[1], g_time[2], g_location[1] / 15);

	len = g_planet.length;

	for(i = 0; i < len; i++)
	{
		getPlanet(g_time[3], i);
	}

	g_time[13] = g_time[4] + "/";

	if(g_time[5] < 10)
	{
		g_time[13] += "0";
	}

	g_time[13] += g_time[5] + "/";

	if(g_time[6] < 10)
	{
		g_time[13] += "0";
	}

	g_time[13] += g_time[6] + " ";

	if(g_time[7] < 10)
	{
		g_time[13] += "0";
	}

	g_time[13] += g_time[7] + ":";

	if(g_time[8] < 10)
	{
		g_time[13] += "0";
	}

	g_time[13] += g_time[8] + ":";

	if(g_time[9] < 10)
	{
		g_time[13] += "0";
	}

	g_time[13] += g_time[9];
}

function pressedTimeUpdateButton()
{
	if(setTime())
	{
		updateTime();
		drawCanvas();
	}
	else
	{
		alert("入力値が不正です。");
	}
}

function pressedLocationUpdateButton()
{
	var flag = new Array(2);

	flag[0] = setLatitude();
	flag[1] = setLongitude();

	if(flag[0] && flag[1])
	{
		g_time[0] = calculateST(g_time[1], g_time[2], g_location[1] / 15);
		drawCanvas();
	}
	else
	{
		alert("入力値が不正です。");
	}
}

/**
 * 緯度を設定する
 *
 * [in]
 * なし
 *
 * [out]
 * 設定OK -> true
 * 設定NG -> false
 *
 */
function setLatitude()
{
	var ret = false;
	var flag = new Array(3);
	var value = new Array(3);
	var res;

	res = checkParameter(document.form.phi_d.value);
	flag[0] = res[0];
	value[0] = res[1];
	res = checkParameter(document.form.phi_m.value);
	flag[1] = res[0];
	value[1] = res[1];
	res = checkParameter(document.form.phi_s.value);
	flag[2] = res[0];
	value[2] = res[1];

	if(flag[0] && flag[1] && flag[2])
	{
		if(value[0] > 90)
		{
			value[0] = 90;
			document.form.phi_d.value = value[0];
		}

		if(value[1] > 59)
		{
			value[1] = 59;
			document.form.phi_m.value = value[1];
		}

		if(value[2] > 59)
		{
			value[2] = 59;
			document.form.phi_s.value = value[2];
		}

		g_location[3] = value[0];
		g_location[4] = value[1];
		g_location[5] = value[2];

		// 南緯のとき負数にする
		if(document.form.phi_sign[1].checked)
		{
			g_location[2] = -1;
		}
		else
		{
			g_location[2] = 1;
		}

		g_location[0] = value[0] + value[1] / 60 + value[2] / 3600;
		g_location[0] = g_location[0] * g_location[2] * g_rad;
		ret = true;
	}

	return ret;
}

/**
 * 経度を設定する
 */
function setLongitude()
{
	var ret = false;
	var flag = new Array(3);
	var value = new Array(3);
	var res;

	res = checkParameter(document.form.lam_d.value);
	flag[0] = res[0];
	value[0] = res[1];
	res = checkParameter(document.form.lam_m.value);
	flag[1] = res[0];
	value[1] = res[1];
	res = checkParameter(document.form.lam_s.value);
	flag[2] = res[0];
	value[2] = res[1];

	if(flag[0] && flag[1] && flag[2])
	{
		if(value[0] > 180)
		{
			value[0] = 180;
			document.form.lam_d.value = value[0];
		}

		if(value[1] > 59)
		{
			value[1] = 59;
			document.form.lam_m.value = value[1];
		}

		if(value[2] > 59)
		{
			value[2] = 59;
			document.form.lam_s.value = value[2];
		}

		g_location[7] = value[0];
		g_location[8] = value[1];
		g_location[9] = value[2];

		// 西経のとき負数にする
		if(document.form.lam_sign[1].checked)
		{
			g_location[6] = -1;
		}
		else
		{
			g_location[6] = 1;
		}

		g_location[1] = value[0] + value[1] / 60 + value[2] / 3600;
		g_location[1] = g_location[1] * g_location[6];
		ret = true;
	}

	return ret;
}

function round(n)
{
	return Math.round(n * 1000) / 1000;
}

function update()
{
	drawCanvas();
}

function updateTimer()
{
	if(g_drawn_flag)
	{
		g_drawn_flag = false;
		g_time[11] += g_rotation_speed[g_time[12]];
		var d = new Date(g_time[11]);
		document.form.year.value = d.getFullYear();
		document.form.month.value = d.getMonth() + 1;
		document.form.date.value = d.getDate();
		document.form.hour.value = d.getHours();
		document.form.minute.value = d.getMinutes();
		document.form.second.value = d.getSeconds();
		setTime();
		updateTime();
		drawCanvas();
	}
}

function updateTimerRealTime()
{
	if(g_drawn_flag)
	{
		g_drawn_flag = false;
		var d = new Date();
		document.form.year.value = d.getFullYear();
		document.form.month.value = d.getMonth() + 1;
		document.form.date.value = d.getDate();
		document.form.hour.value = d.getHours();
		document.form.minute.value = d.getMinutes();
		document.form.second.value = d.getSeconds();
		setTime();
		updateTime();
		drawCanvas();
	}
}

function start()
{
	if(timer == null)
	{
		timer = setInterval("updateTimer()", g_timer_interval);
	}
}

function startRealTime()
{
	if(timer == null)
	{
		timer = setInterval("updateTimerRealTime()", 1000);
	}
}

function stop()
{
	clearInterval(timer);
	timer = null;
}

function back()
{
	g_time[12]--;

	if(g_time[12] < 0)
	{
		g_time[12] = 0;
	}

	changeRotationTime();
}

function forward()
{
	g_time[12]++;

	if(g_time[12] > g_rotation_speed.length - 1)
	{
		g_time[12] = g_rotation_speed.length - 1;
	}

	changeRotationTime();
}

/**
 * ユリウス通日を計算する
 */
function calculateJulianDay(year, month, date, hour, minute, second)
{
	var ret, y, m;

	y = year;
	m = month;

	if(m < 3)
	{
		m = m + 12;
		y = y - 1;
	}

	ret = Math.floor(30.59 * (m - 2)) + date + hour / 24 + minute / 1440 + second / 86400;
	ret += Math.floor(365.25 * y);
	ret += Math.floor(y / 400) - Math.floor(y / 100) + 1721088.5;

	return ret;
}

function drawRealRect(x,y, width, height, r, g, b, a)
{
	var i, len, image_data, data;

	image_data = c.createImageData(width, height);
	data = image_data.data;

	len = image_data.width * image_data.height;

	for(i = 0; i < len; i++)
	{
		data[i * 4] = r;
		data[i * 4 + 1] = g;
		data[i * 4 + 2] = b;
		data[i * 4 + 3] = a;
	}

	c.putImageData(image_data, x, y);
}

function drawStar(x, y, mag)
{
	var image_data = c.createImageData(1, 1);
	var data = image_data.data;
	var alpha = Math.pow(1 / 100, (mag + 2) / 5.0) * Math.pow(Math.exp(mag + 2), 0.65) * 255;
	data[0] = alpha;
	data[1] = alpha;
	data[2] = alpha;
	data[3] = 255;
	c.putImageData(image_data, x, y);
}

function drawPlanet(x, y, r, g, b)
{
	var image_data = c.createImageData(1, 1);
	var data = image_data.data;
	data[0] = r;
	data[1] = g;
	data[2] = b;
	data[3] = 255;
	c.putImageData(image_data, x, y);
}

function drawCanvas()
{
	var time0 = +new Date();
	var i, j, len, len2, mag_len, res, res2, x, y, r, g, b, screen_x, screen_y, screen_r;

	c.save();

	if(g_horizon_flag)
	{
		c.fillStyle = "#002000";
	}
	else
	{
		c.fillStyle = "#000000";
	}

	c.fillRect(0, 0, window_width, window_height);
	screen_x = window_width / 2;
	screen_y = window_height / 2;

	if(window_width > window_height)
	{
		screen_r = screen_y - 30;
	}
	else
	{
		screen_r = screen_x - 30;
	}

	c.font = "12px sans-serif";

	if(g_az_font_flag)
	{
		c.fillStyle = "#ffffff";
		c.fillText("北", screen_x - 5, screen_y - screen_r - 5);
		c.fillText("南", screen_x - 5, screen_y + screen_r + 15);
		c.fillText("東", screen_x - screen_r - 15, screen_y + 3);
		c.fillText("西", screen_x + screen_r + 3, screen_y + 3);
	}

	drawRealRect(10, 10, 1, window_height - 20, 255, 255, 255, 255);
	drawRealRect(10, 10, window_width - 20, 1, 255, 255, 255, 255);
	drawRealRect(window_width - 10, 10, 1, window_height - 19, 255, 255, 255, 255);
	drawRealRect(10, window_height - 10, window_width - 19, 1, 255, 255, 255, 255);

	var t = (g_time[3] - 2451545) / 36525;
	var epsilon = calculateObliquity(t);
	var sun = new Array(5);
	sun[4] = calculateSunEclipticLongitude(t);
	sun[2] = calculateRightAscension(sun[4], 0, epsilon);
	sun[3] = calculateDeclination(sun[4], 0, epsilon);
	res = convertHorizontalCoordinateSystem(sun[2], sun[3], g_time[0] * 15 * g_rad, g_location[0]);
	sun[0] = res[0];
	sun[1] = res[1];

	var moon = new Array(6);
	t = (g_time[3] - 2451545) / 365.25;
	moon[4] = calculateMoonEclipticLongitude(t);
	moon[5] = calculateMoonEclipticLatitude(t);
	moon[2] = calculateRightAscension(moon[4], moon[5], epsilon);
	moon[3] = calculateDeclination(moon[4], moon[5], epsilon);
	res = convertHorizontalCoordinateSystem(moon[2], moon[3], g_time[0] * 15 * g_rad, g_location[0]);
	moon[0] = res[0];
	moon[1] = res[1];

	if(g_horizon_flag)
	{
		c.beginPath();
		c.arc(screen_x, screen_y, screen_r, 0, Math.PI * 2, true);
		c.clip();

		if(sun[1] <= 5 * g_rad && sun[1] >= -18 * g_rad)
		{
			r = Math.floor(102 * (18 + sun[1] * g_deg) / 23);
			g = Math.floor(153 * (18 + sun[1] * g_deg) / 23);
			b = Math.floor(204 * (18 + sun[1] * g_deg) / 23);
			mag_len = g_show_star_len - g_show_star_len * (18 + sun[1] * g_deg) / 23;
		}
		else if(sun[1] < -18 * g_rad)
		{
			r = 0;
			g = 0;
			b = 0;
			mag_len = g_show_star_len;
		}
		else
		{
			r = 102;
			g = 153;
			b = 204;
			mag_len = 0;
		}

		c.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
		c.fillRect(0, 0, window_width, window_height);
	}
	else
	{
		c.strokeStyle = "#333333";
		c.beginPath();
		c.arc(screen_x, screen_y, screen_r, 0, Math.PI * 2, true);
		c.stroke();
		mag_len = g_show_star_len;
	}

	if(g_alt_line_flag)
	{
		len = 9;
		c.lineWidth = 0.5;
		c.strokeStyle = "#330033";

		for(i = 1; i < len; i++)
		{
			c.beginPath();
			c.arc(screen_x, screen_y, screen_r * i / 9, 0, Math.PI * 2, true);
			c.stroke();
		}
	}

	if(g_az_line_flag)
	{
		len = 36;
		c.lineWidth = 0.5;
		c.strokeStyle = "#330033";

		for(i = 0; i < len; i++)
		{
			c.beginPath();
			x = screen_r * Math.cos(i * 10 * g_rad) + screen_x;
			y = screen_r * Math.sin(i * 10 * g_rad) + screen_y;
			c.moveTo(x, y);
			x = screen_r * 0.5 / 9 * Math.cos(i * 10 * g_rad) + screen_x;
			y = screen_r * 0.5 / 9 * Math.sin(i * 10 * g_rad) + screen_y;
			c.lineTo(x, y);
			c.stroke();
		}

		drawRealRect(screen_x - 3, screen_y, 7, 1, 51, 0, 51, 255);
		drawRealRect(screen_x, screen_y - 3, 1, 7, 51, 0, 51, 255);
	}

	if(g_constellation_line_flag)
	{
		c.lineWidth = 0.5;
		c.strokeStyle = "#333300";
		len = CONSTELLATION_LINE.length;

		for(i = 0; i < len; i++)
		{
			len2 = (CONSTELLATION_LINE[i].length - 1) / 6;

			for(j = 0; j < len2; j++)
			{
				res = convertHorizontalCoordinateSystem(CONSTELLATION_LINE[i][j * 6 + 3] * g_rad, CONSTELLATION_LINE[i][j * 6 + 4] * g_rad, g_time[0] * 15 * g_rad, g_location[0]);
				res2 = convertHorizontalCoordinateSystem(CONSTELLATION_LINE[i][j * 6 + 5] * g_rad, CONSTELLATION_LINE[i][j * 6 + 6] * g_rad, g_time[0] * 15 * g_rad, g_location[0]);

				if(res[1] > 0 || res2[1] > 0)
				{
					res[0] -= Math.PI / 2;
					r = (Math.PI / 2 - res[1]) / (Math.PI / 2) * screen_r;
					x = r * Math.cos(res[0]) * (-1) + screen_x;
					y = r * Math.sin(res[0]) + screen_y;

					c.beginPath();
					c.moveTo(x, y);

					res2[0] -= Math.PI / 2;
					r = (Math.PI / 2 - res2[1]) / (Math.PI / 2) * screen_r;
					x = r * Math.cos(res2[0]) * (-1) + screen_x;
					y = r * Math.sin(res2[0]) + screen_y;

					c.lineTo(x, y);
					c.stroke();
				}
			}
		}
	}

	for(i = 0; i < mag_len; i++)
	{
		len = STAR[5 - i].length;

		for(j = 0; j < len; j++)
		{
			res = convertHorizontalCoordinateSystem(STAR[5 - i][j][1] * g_rad, STAR[5 - i][j][2] * g_rad, g_time[0] * 15 * g_rad, g_location[0]);

			if(res[1] > 0)
			{
				res[0] -= Math.PI / 2;
				r = (Math.PI / 2 - res[1]) / (Math.PI / 2) * screen_r;
				x = r * Math.cos(res[0]) * (-1) + screen_x;
				y = r * Math.sin(res[0]) + screen_y;
				drawStar(x, y, STAR[5 - i][j][5]);
			}
		}
	}

	len = g_planet.length;
	c.fillStyle = "#ffffff";

	for(i = 0; i < len; i++)
	{
		if(g_planet[i][0])
		{
			res = convertHorizontalCoordinateSystem(g_planet[i][1], g_planet[i][2], g_time[0] * 15 * g_rad, g_location[0]);

			if(res[1] > 0)
			{
				res[0] -= Math.PI / 2;
				r = (Math.PI / 2 - res[1]) / (Math.PI / 2) * screen_r;
				x = r * Math.cos(res[0]) * (-1) + screen_x;
				y = r * Math.sin(res[0]) + screen_y;
				drawPlanet(x, y, g_planet[i][3], g_planet[i][4], g_planet[i][5]);

				if(g_planet_name_flag)
				{
					c.fillText(g_planet[i][6], x + 3, y - 3);
				}
			}
		}
	}

	sun[0] -= Math.PI / 2;
	r = (Math.PI / 2 - sun[1]) / (Math.PI / 2) * screen_r;
	x = r * Math.cos(sun[0]) * (-1) + screen_x;
	y = r * Math.sin(sun[0]) + screen_y;

	if(g_horizon_flag)
	{
		if(sun[1] < 20 * g_rad && sun[1] >= 0)
		{
			r = Math.floor(255);
			g = Math.floor(204 + 51 * sun[1] * g_deg / 20);
			b = Math.floor(102 + 153 * sun[1] * g_deg / 20);
		}
		else if(sun[1] < 0 && sun[1] >= -20 * g_rad)
		{
			r = Math.floor(255 * (sun[1] * g_deg + 20) / 20);
			g = Math.floor(204 * (sun[1] * g_deg + 20) / 20);
			b = Math.floor(102 * (sun[1] * g_deg + 20) / 20);
		}
		else if(sun[1] < -20 * g_rad)
		{
			r = 0;
			g = 0;
			b = 0;
		}
		else
		{
			r = 255;
			g = 255;
			b = 255;
		}

		var grad = c.createRadialGradient(screen_x, screen_y, screen_r * 0.925, screen_x, screen_y, screen_r * 1.05);
		grad.addColorStop(0, "rgba(" + r + "," + g + "," + b + ",0)");
		grad.addColorStop(1, "rgba(" + r + "," + g + "," + b + ",0.3)");
		c.fillStyle = grad;
		c.fillRect(screen_x - screen_r, screen_y - screen_r, screen_r * 2, screen_r * 2);

		grad = c.createRadialGradient(x, y, 1, x, y, 90);
		grad.addColorStop(0, "rgba(" + r + "," + g + "," + b + ",0.9)");
		grad.addColorStop(0.2, "rgba(" + r + "," + g + "," + b + ",0.6)");
		grad.addColorStop(0.4, "rgba(" + r + "," + g + "," + b + ",0.3)");
		grad.addColorStop(0.6, "rgba(" + r + "," + g + "," + b + ",0.15)");
		grad.addColorStop(0.8, "rgba(" + r + "," + g + "," + b + ",0.05)");
		grad.addColorStop(1, "rgba(" + r + "," + g + "," + b + ",0)");
		c.fillStyle = grad;
		c.fillRect(x - 100, y - 100, 200, 200);
	}

	if(sun[1] > 0)
	{
		g += 50;

		if(g > 255)
		{
			g = 255;
		}

		b += 50;

		if(b > 255)
		{
			b = 255;
		}

		c.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
		c.beginPath();
		c.arc(x, y, 3, 0, Math.PI * 2, true);
		c.fill();
	}

	moon[0] -= Math.PI / 2;
	r = (Math.PI / 2 - moon[1]) / (Math.PI / 2) * screen_r;
	x = r * Math.cos(moon[0]) * (-1) + screen_x;
	y = r * Math.sin(moon[0]) + screen_y;

	if(moon[1] > 0)
	{
		c.fillStyle = "#ffffcc";
		c.beginPath();
		c.arc(x, y, 3, 0, Math.PI * 2, true);
		c.fill();
		c.fillText("月", x + 5, y - 5);
	}

	if(g_constellation_name_flag)
	{
		c.fillStyle = "#ffffff";
		len = CONSTELLATION.length;

		for(i = 0; i < len; i++)
		{
			res = convertHorizontalCoordinateSystem(CONSTELLATION[i][0] * g_rad, CONSTELLATION[i][1] * g_rad, g_time[0] * 15 * g_rad, g_location[0]);

			if(res[1] > 0)
			{
				res[0] -= Math.PI / 2;
				r = (Math.PI / 2 - res[1]) / (Math.PI / 2) * screen_r;
				x = r * Math.cos(res[0]) * (-1) + screen_x;
				y = r * Math.sin(res[0]) + screen_y;
				c.fillText(CONSTELLATION[i][5], x, y);
			}
		}
	}

	c.restore();
	c.fillStyle = "#ffffff";
	c.fillText(g_time[13], 20, window_height - 20);

	if(g_drawn_time_flag)
	{
		c.fillStyle = "#ffffff";
		var time1 = +new Date();
		time1 = time1 - time0;
		c.fillText(time1 + "ms", window_width - 50, window_height - 20);
	}

	g_drawn_flag = true;
}

/**
 * 赤道座標を地平座標に変換する
 *
 * [in]
 * alpha : 天体の赤経[rad]
 * delta : 天体の赤緯[rad]
 * theta : 観測地の恒星時[rad]
 * phi : 観測地の緯度[rad]
 *
 * [out]
 * 地平座標 -> 0:方位角[rad], 1:高度[rad]
 *
 */
function convertHorizontalCoordinateSystem(alpha, delta, theta, phi)
{
	var ret0, ret1, h, sin_h, cos_h, sin_delta, cos_delta, sin_phi, cos_phi, sin_az, cos_az;

	h = theta - alpha;

	if(h < 0)
	{
		h += Math.PI * 2;
	}

	sin_h = Math.sin(h);
	cos_h = Math.cos(h);
	sin_delta = Math.sin(delta);
	cos_delta = Math.cos(delta);
	sin_phi = Math.sin(phi);
	cos_phi = Math.cos(phi);

	ret1 = sin_delta * sin_phi + cos_delta * cos_phi * cos_h;
	ret1 = Math.asin(ret1);

	sin_az = cos_delta * sin_h / Math.cos(ret1);
	cos_az = (sin_delta * cos_phi - cos_delta * sin_phi * cos_h) / Math.cos(ret1);
	ret0 = Math.asin(sin_az);

	// 0-90:N-E or 270-360:W-N
	if(cos_az >= 0)
	{
		ret0 *= -1;

		// 270-360:W-N
		if(sin_az >= 0)
		{
			ret0 += Math.PI * 2;
		}
	}
	// 90-180:E-S or 180-270:S-W
	else if(cos_az < 0)
	{
		ret0 += Math.PI;
	}

	return [ret0, ret1, h];
}

/**
 * グリニッジ平均恒星時(2000.0分点)を計算する
 */
function calculateGST2000(jd0)
{
	var ret, t;

	t = (jd0 - 2451545.0) / 36525;
	t = (24110.54841 + 8640184.812866 * t + 0.093104 * t * t - 0.0000062 * t * t * t) / 86400;
	ret = 24 * (t - Math.floor(t));

	return ret;
}

/**
 * 恒星時を計算する
 */
function calculateST(gst, hour, lambda)
{
	var ret;

	ret = gst + 1.00273791 * hour + lambda;

	// 恒星時が0時未満のとき
	while(ret < 0)
	{
		ret += 24;
	}

	// 恒星時が24時以上のとき
	while(ret >= 24)
	{
		ret -= 24;
	}

	return ret;
}

function checkParameter(value)
{
	var ret0, ret1;

	ret0 = false;

	if(value == "")
	{
		ret0 = true;
	}
	else
	{
		ret0 = g_not_int_pattern.test(value);
	}

	if(ret0)
	{
		ret1 = value;
	}
	else
	{
		ret1 = parseInt(value);
	}

	return [!ret0, ret1];
}

/**
 * 計算
 */
function getPlanet(jd, planet_id)
{
	var ret, r_ecl, r_ecl_earth, t;
	var AU, G, M_Sun;
	var elements, K0, a, b, e, I, Omega, omega, varpi;
	var RA, Dec, x1, y1, z1, epsilon, res;

	t = (jd - 2451545.0) / 36525.0;

	if(2378496.5 <= jd && jd < 2469807.5)
	{
		elements = PLANET_ELEMENTS[planet_id][0];
	}
	else
	{
		elements = PLANET_ELEMENTS[planet_id][1];
	}

	a = elements[0] + elements[6] * t;
	e = elements[1] + elements[7] * t;
	b = a * Math.sqrt(1 - e * e);
	I = elements[2] * g_rad + elements[8] * g_rad * t;
	varpi = elements[4] * g_rad + elements[10] * g_rad * t;
	Omega = elements[5] * g_rad + elements[11] * g_rad * t;
	omega = varpi - Omega;

	AU = 149597870700;
	G = 6.67384e-11;
	M_Sun = 1.9891e+30;
	K0 = Math.sqrt((G * M_Sun) / (AU * AU * AU)) * 86400;

	r_ecl = getRecl(I, Omega, omega, elements, varpi, a, b, e, t);

	if(2378496.5 <= jd && jd < 2469807.5)
	{
		elements = EARTH_ELEMENTS;
	}
	else
	{
		elements = EARTH_ELEMENTS_LONG;
	}

	a = elements[0] + elements[6] * t;
	e = elements[1] + elements[7] * t;
	b = a * Math.sqrt(1 - e * e);
	I = elements[2] * g_rad + elements[8] * g_rad * t;
	varpi = elements[4] * g_rad + elements[10] * g_rad * t;
	Omega = elements[5] * g_rad + elements[11] * g_rad * t;
	omega = varpi - Omega;

	r_ecl_earth = getRecl(I, Omega, omega, elements, varpi, a, b, e, t);

	epsilon = (84381.406 - 46.836769 * t - 0.00059 * t * t + 0.001813 * t * t * t) / 3600.0 * g_rad;
	x1 = r_ecl[0] - r_ecl_earth[0];
	y1 = (r_ecl[1] - r_ecl_earth[1]) * Math.cos(epsilon) - (r_ecl[2] - r_ecl_earth[2]) * Math.sin(epsilon);
	z1 = (r_ecl[1] - r_ecl_earth[1]) * Math.sin(epsilon) + (r_ecl[2] - r_ecl_earth[2]) * Math.cos(epsilon);
	RA = Math.atan(y1 / x1);
	Dec = Math.atan(z1 / Math.sqrt(x1 * x1 + y1 * y1));

	if(x1 > 0 && y1 < 0)
	{
		RA = RA + Math.PI * 2;
	}

	if(x1 < 0)
	{
		RA = RA + Math.PI;
	}


	res = getPrecession(RA, Dec, t);
	g_planet[planet_id][1] = res[0];
	g_planet[planet_id][2] = res[1];
}

/**
 * 日心黄道座標
 */
function getRecl(I, Omega, omega, elements, varpi, a, b, e, t)
{
	var ret, x_prime, y_prime;
	var M11, M12, M21, M22, M31, M32;
	var cos_I, sin_I, cos_Omega, sin_Omega, cos_omega, sin_omega, M, E, L, E0, delta_E;

	cos_I = Math.cos(I);
	sin_I = Math.sin(I);
	cos_Omega = Math.cos(Omega);
	sin_Omega = Math.sin(Omega);
	cos_omega = Math.cos(omega);
	sin_omega = Math.sin(omega);

	M11 =  cos_omega * cos_Omega - sin_omega * sin_Omega * cos_I;
	M12 = -sin_omega * cos_Omega - cos_omega * sin_Omega * cos_I;
	M21 =  cos_omega * sin_Omega + sin_omega * cos_Omega * cos_I;
	M22 = -sin_omega * sin_Omega + cos_omega * cos_Omega * cos_I;
	M31 =  sin_omega * sin_I;
	M32 =  cos_omega * sin_I;

	L = elements[3] * g_rad + elements[9] * g_rad * t;
	M = L - varpi;

	if(elements.length >= 13)
	{
		M += elements[12] * g_rad * t * t;

		if (elements.length >= 16)
		{
			var fT = elements[13] * g_rad * t;
			M += elements[14] * g_rad * Math.cos(fT) + elements[15] * g_rad * Math.sin(fT);
		}
	}

	M = M - Math.floor((M + Math.PI) / (Math.PI * 2)) * Math.PI * 2;
	E0 = M;

	do
	{
		delta_E = (M - E0 + e * Math.sin(E0)) / (1 - e * Math.cos(E0));
		E = E0 + delta_E;
		E0 = E;
	}
	while(Math.abs(delta_E) < 0.00001);

	ret = new Array(3);
	x_prime = a * (Math.cos(E) - e);
	y_prime = b * Math.sin(E);
	ret[0] = M11 * x_prime + M12 * y_prime;
	ret[1] = M21 * x_prime + M22 * y_prime;
	ret[2] = M31 * x_prime + M32 * y_prime;

	return ret;
}

/**
 * 歳差
 */
function getPrecession(a0, d0, t)
{
	var ret = new Array();
	var zeta, z, theta, l1, m1, n1, l2, m2, n2, a1, d1, sin_a0, sin_d0, cos_a0, cos_d0, sin_zeta, sin_z, sin_theta, cos_zeta, cos_z, cos_theta;

	sin_a0 = Math.sin(a0);
	sin_d0 = Math.sin(d0);
	cos_a0 = Math.cos(a0);
	cos_d0 = Math.cos(d0);
	l1 = cos_a0 * cos_d0;
	m1 = sin_a0 * cos_d0;
	n1 = sin_d0;

	zeta = (2304.250 + 1.396) * t + 0.302 * t * t + 0.018 * t * t * t;
	z = zeta + 0.791 * t * t + 0.001 * t * t * t;
	theta = (2004.682 - 0.853) * t - 0.426 * t * t - 0.042 * t * t * t;
	zeta = g_rad * (zeta / 3600.0);
	z = g_rad * (z / 3600.0);
	theta = g_rad * (theta / 3600.0);
	sin_zeta = Math.sin(zeta);
	sin_z = Math.sin(z);
	sin_theta = Math.sin(theta);
	cos_zeta = Math.cos(zeta);
	cos_z = Math.cos(z);
	cos_theta = Math.cos(theta);

	l2 = (cos_zeta * cos_z * cos_theta - sin_zeta * sin_z) * l1 + (-sin_zeta * cos_z * cos_theta - cos_zeta * sin_z) * m1 + (-cos_z * sin_theta) * n1;
	m2 = (cos_zeta * sin_z * cos_theta + sin_zeta * cos_z) * l1 + (-sin_zeta * sin_z * cos_theta + cos_zeta * cos_z) * m1 + (-sin_z * sin_theta) * n1;
	n2 = cos_zeta * sin_theta * l1 + (-sin_zeta * sin_theta) * m1 + cos_theta * n1;
	a1 = Math.atan(m2 / l2);
	d1 = Math.asin(n2);

	if(a1 > Math.PI * 2)
	{
		a1 -= Math.PI * 2;
	}

	if(a1 < 0)
	{
		a1 += Math.PI * 2;
	}

	if(l2 >= 0)
	{
		if(a1 >= Math.PI / 2 && a1 < Math.PI)
		{
			a1 += Math.PI;
		}
		else if(a1 >= Math.PI && a1 < Math.PI* 3 / 2)
		{
			a1 -= Math.PI;
		}
	}

	if(l2 < 0)
	{
		if(a1 >= 0 && a1 < Math.PI / 2)
		{
			a1 += Math.PI;
		}
		else if(a1 >= Math.PI * 3 / 2 && a1 < Math.PI * 2)
		{
			a1 -= Math.PI;
		}
	}

	ret[0] = a1;
	ret[1] = d1;

	return ret;
}

/**
 * 太陽の黄経を計算する
 *
 * @param t 2000年1月1日12時(世界時)からのユリウス世紀
 *
 * @return 太陽黄経(rad)
 */
function calculateSunEclipticLongitude(t)
{
	var ret, i;

	ret = 0;

	for(i = 0; i < 15; i++)
	{
		ret += SUN[i][0] * Math.cos((SUN[i][1] * t + SUN[i][2]) * g_rad);
	}

	for(i = 0; i < 3; i++)
	{
		ret += SUN[i + 15][0] * t * Math.cos((SUN[i + 15][1] * t + SUN[i + 15][2]) * g_rad);
	}

	ret += 36000.7695 * t + 280.4602 + 0.0057;
	ret *= g_rad;

	return ret;
}

/**
 * 月の幾何学的黄経を計算する
 */
function calculateMoonEclipticLongitude(t)
{
	var ret, i, a;

	a = 0;

	for(i = 63; i < 67; i++)
	{
		a += MOON_L[i][0] * Math.sin((MOON_L[i][1] + MOON_L[i][2] * t) * g_rad);
	}

	ret = MOON_L[0][0] + MOON_L[0][1] * t;
	ret += MOON_L[0][2] * Math.sin((MOON_L[0][3] + MOON_L[0][4] * t + a) * g_rad);

	for(i = 1; i < 63; i++)
	{
		ret += MOON_L[i][0] * Math.sin((MOON_L[i][1] + MOON_L[i][2] * t) * g_rad);
	}

	ret += 0.0057;

	while(ret >= 360)
	{
		ret -= 360;
	}

	while(ret < 0)
	{
		ret += 360;
	}

	return ret * g_rad;
}

/**
 * 月の黄緯を計算する
 */
function calculateMoonEclipticLatitude(t)
{
	var ret, i, b;

	b = 0;

	for(i = 47; i < 52; i++)
	{
		b += MOON_B[i][0] * Math.sin((MOON_B[i][1] + MOON_B[i][2] * t) * g_rad);
	}

	ret = MOON_B[0][0] * Math.sin((MOON_B[0][1] + MOON_B[0][2] * t + b) * g_rad);

	for(i = 1; i < 47; i++)
	{
		ret += MOON_B[i][0] * Math.sin((MOON_B[i][1] + MOON_B[i][2] * t) * g_rad);
	}

	return ret * g_rad;
}

/**
 * 平均黄道傾斜角を計算する
 *
 * @param t 2000年1月1日12時(世界時)からのユリウス世紀
 *
 * @return 平均黄道傾斜角(rad)
 */
function calculateObliquity(t)
{
	var ret;

	ret = 23 + 26 / 60 + 21.406 / 3600 - 46.836769 / 3600 * t;
	ret *= g_rad;

	return ret;
}


/**
 * 視赤経を計算する
 *
 * @param lambda 視黄経(rad)
 * @param beta 視黄緯(rad)
 * @param epsilon 平均黄道傾斜角(rad)
 *
 * @return 視赤経(rad)
 */
function calculateRightAscension(lambda, beta, epsilon)
{
	var ret;

	var cos_alpha = Math.cos(beta) * Math.cos(lambda);
	var sin_alpha = Math.cos(beta) * Math.sin(lambda) * Math.cos(epsilon) - Math.sin(beta) * Math.sin(epsilon);
	ret = asincos(sin_alpha, cos_alpha);

	return ret;
}

/**
 * 視赤緯を計算する
 *
 * @param lambda 視黄経(rad)
 * @param beta 視黄緯(rad)
 * @param epsilon 平均黄道傾斜角(rad)
 *
 * @return 視赤緯(rad)
 */
function calculateDeclination(lambda, beta, epsilon)
{
	var ret;

	ret = Math.cos(beta) * Math.sin(lambda) * Math.sin(epsilon) + Math.sin(beta) * Math.cos(epsilon);
	ret = Math.asin(ret);

	return ret;
}

/**
 * 逆三角関数を求める
 *
 * @param sin sinXの値 [-1, 1]
 * @param cos cosXの値 [-1, 1]
 *
 * @return 角度X [0, 2PI)
 */
function asincos(sin, cos)
{
	var ret;

	ret = Math.acos(cos);

	// reflex angle
	if (sin < 0) {
		ret = Math.PI * 2 - ret;
	}

	return ret;
}