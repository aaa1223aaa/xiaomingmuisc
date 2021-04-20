$(function () {

    // 0.自定义滚动条
    $(".content_list").mCustomScrollbar();

    var $audio = $('audio');
    var player = new Player($audio);
    var progress;
    var voiceProgress;
    var lyric;
    var tiaomu = 2;

    // 1.加载歌曲列表
    getPlayerList();
    function getPlayerList() {
        $.ajax({
            url: "source/musicList.json",
            dataType: "json",
            success: function (data) {
                player.musicList = data;
                var $musicList = $(".content_list ul");

                $.each(data, function (index, ele) {
                    var $item = createMusicItem(index, ele);

                    $musicList.append($item);
                })
                // 初始化歌曲
                initMusicInfo(data[0]);
                initMusicLyric(data[0]);

            },
            error: function (e) {
                console.log(e);
            }
        })
    }

    // 初始化歌曲信息
    function initMusicInfo(music) {
        var $musicImage = $(".song_info_pic img");
        var $musicName = $(".song_info_name a");
        var $musicSinger = $(".song_info_singer a");
        var $musicAblum = $(".song_info_ablum a");
        var $musicProgressName = $(".music_progress_name");
        var $musicProgressTime = $(".music_progress_time");
        var $musicBg = $(".mask_bg");

        // 给获取到的元素赋值
        $musicImage.attr("src", music.cover);
        $musicName.text(music.name);
        $musicSinger.text(music.singer);
        $musicAblum.text(music.album);
        $musicProgressName.text(music.name + " / " + music.singer);
        $musicProgressTime.text("00:00 / " + music.time);
        $musicBg.css("background", "url('" + music.cover + "')");
    }

    // 3.初始化歌词信息
    function initMusicLyric(music) {
        lyric = new Lyric(music.link_lrc);
        var $lryicContainer = $(".song_lyric");
        // 清空上一首音乐的歌词
        $lryicContainer.html("");
        lyric.loadLyric(function () {
            // 创建歌词列表
            $.each(lyric.lyrics, function (index, ele) {
                var $item = $("<li>" + ele + "</li>");
                $lryicContainer.append($item);
            });
        });
    }

    // 4.初始化进度条
    initProgress();
    function initProgress() {
        var $progressBar = $(".music_progress_bar");
        var $progressLine = $(".music_progress_line");
        var $progressDot = $(".music_progress_dot");
        progress = Progress($progressBar, $progressLine, $progressDot);
        progress.progressClick(function (value) {
            player.musicSeekTo(value);
        });
        progress.progressMove(function (value) {
            player.musicSeekTo(value);
        });


        var $voiceBar = $(".music_voice_bar");
        var $voiceLine = $(".music_voice_line");
        var $voiceDot = $(".music_voice_dot");
        voiceProgress = Progress($voiceBar, $voiceLine, $voiceDot);
        voiceProgress.progressClick(function (value) {
            player.musicVoiceSeekTo(value);
        });
        voiceProgress.progressMove(function (value) {
            player.musicVoiceSeekTo(value);
        });
    }

    // 5.初始化事件监听
    initEvents();
    function initEvents() {

        // 1.监听歌曲的移入移出事件
        // 移入事件
        $(".content_list").delegate(".list_music", "mouseenter", function () {
            // 显示子菜单
            $(this).find(".list_menu").stop().fadeIn(100);
            $(this).find(".list_time a").stop().fadeIn(100);
            // 隐藏时长
            $(this).find(".list_time span").stop().fadeOut(100);
        });
        // 移出事件
        $(".content_list").delegate(".list_music", "mouseleave", function () {
            // 隐藏子菜单
            $(this).find(".list_menu").stop().fadeOut(100);
            $(this).find(".list_time a").stop().fadeOut(100);
            // 显示时长
            $(this).find(".list_time span").stop().fadeIn(100);
        });

        // 2.监听复选框的点击事件
        $(".content_list").delegate(".list_check", "click", function () {
            $(this).toggleClass("list_checked");
        });

        //3.监听播放按钮
        var $musicPlay = $(".music_play");
        $(".content_list").delegate(".list_menu_play", "click", function () {
            // 切换按钮播放状态
            $(this).toggleClass("list_menu_play2");
            var $item = $(this).parents(".list_music");

            // 其他列表播放按钮清空
            $item.siblings().find(".list_menu_play").removeClass("list_menu_play2");


            // 判断正在播放的状态，切换状态
            if ($(this).attr("class").indexOf("list_menu_play2") != -1) {


                // 让主播放按钮是播放状态
                $(".music_play").addClass("music_play2");

                // 让列表文字高亮
                $item.find("div").css("color", "#fff");

                // 让其他列表文字不高亮
                $item.siblings().find("div").css("color", "rgba(255,255,255,0.5");

            }
            else {


                // 让主播放按钮不是播放状态
                $(".music_play").removeClass("music_play2");

                // 让列表文字不高亮
                $item.find("div").css("color", "rgba(255,255,255,0.5");

            }

            $item.find(".list_number").toggleClass("list_number2");
            $item.siblings().find(".list_number").removeClass("list_number2");

            // 播放音乐
            if (player.currentIndex != $item.get(0).index) {
                initMusicLyric($item.get(0).music);
            }
            player.playMusic($item.get(0).index, $item.get(0).music);
            initMusicInfo($item.get(0).music);


        })

        //4.监听底部控制播放区播放按钮点击
        $musicPlay.click(function () {
            if (player.currentIndex == -1) {
                //没有播放音乐
                // 点击一下第一首歌的播放按钮
                $('.list_music').eq(0).find('.list_menu_play').trigger('click');

            } else {
                //有播放音乐
                //  点击一下这首歌的播放按钮让他暂停

                $('.list_music').eq(player.currentIndex).find('.list_menu_play').trigger('click');


            }
        })

        //5.监听底部控制播放区上一首按钮点击
        $('.music_pre').click(function () {
            $('.list_music').eq(player.preIndex()).find('.list_menu_play').trigger('click');

        })

        //6.监听底部控制播放区下一首按钮点击
        $('.music_next').click(function () {
            $('.list_music').eq(player.nextIndex()).find('.list_menu_play').trigger('click');

        })

        //7.监听删除按钮的点击
        $(".content_list").delegate(".list_menu_del", "click", function () {
            var $item = $(this).parents(".list_music")

            if ($item.get(0).index == player.currentIndex) {
                $(".music_next").trigger("click");
            } else {

            }
            // 删除主页上的歌曲
            $item.remove();
            // 改变后台的歌曲数据
            player.changeMusic($item.get(0).index)
            // 重新排序
            $(".list_music").each(function (index, ele) {
                ele.index = index;
                $(ele).find(".list_number").text(index + 1);
            })


        })

        // 8.监听播放的进度
        player.musicTimeUpdate(function (currentTime, duration, timeStr) {
            // 同步时间
            $(".music_progress_time").text(timeStr);
            // 同步进度条
            // 计算播放比例
            var value = currentTime / duration * 100;
            progress.setProgress(value);
            if (value == 100) {
                $('.music_next').click();
            }
            // 实现歌词同步
            var index = lyric.currentIndex(currentTime);
            var $item = $(".song_lyric li").eq(index);
            $item.addClass("cur");
            $item.siblings().removeClass("cur");

            // 实现歌词滚动
            if (index <= tiaomu) return;
            $(".song_lyric").css({
                marginTop: (-index + tiaomu) * 30
            });

            // console.log($('.song_lyric li[1]').offsetTop);
            // console.log($zgs.css("margin-top"));
            // var mtop = $zgs.offsetTop;
            // 实现歌词滚动
            // $(".song_lyric").css({
            //     marginTop: (-($item.get(0).offsetTop-353) + 60)
            // });

            // // 实现歌词滚动
            // if (index <= 0) return;
            // var aa = 0
            // var lyrictime = setInterval(function () {
            //     aa++;
            //     $(".song_lyric").css({
            //         marginTop: -aa * 3 +index*30
            //     })
            //     if (aa == 10) {
            //         clearInterval(lyrictime);
            //     }
            // }, 100)


        });
        // 9.监听声音按钮的点击
        $(".music_voice_icon").click(function () {
            // 图标切换
            $(this).toggleClass("music_voice_icon2");
            // 声音切换
            if ($(this).hasClass("music_voice_icon2")) {
                // 变为没有声音
                player.musicVoiceSeekTo(0);
            } else {
                // 变为有声音
                player.musicVoiceSeekTo(1);
            }
        });


    }




    // 创建一条歌曲
    function createMusicItem(index, music) {

        var $item = $("" +
            "<li class=\"list_music\">\n" +
            "<div class=\"list_check\"><i></i></div>\n" +
            "<div class=\"list_number\">" + (index + 1) + "</div>\n" +
            "<div class=\"list_name\">" + music.name + "" +
            "     <div class=\"list_menu\">\n" +
            "          <a href=\"javascript:;\" title=\"播放\" class='list_menu_play'></a>\n" +
            "          <a href=\"javascript:;\" title=\"添加\"></a>\n" +
            "          <a href=\"javascript:;\" title=\"下载\"></a>\n" +
            "          <a href=\"javascript:;\" title=\"分享\"></a>\n" +
            "     </div>\n" +
            "</div>\n" +
            "<div class=\"list_singer\">" + music.singer + "</div>\n" +
            "<div class=\"list_time\">\n" +
            "     <span>" + music.time + "</span>\n" +
            "     <a href=\"javascript:;\" title=\"删除\" class='list_menu_del'></a>\n" +
            "</div>\n" +
            "</li>");

        // 让每一首歌创建时产生的index和music保存给每一条列表的$item.get(0).index和music
        $item.get(0).index = index;
        $item.get(0).music = music;


        return $item;
    }

    // 纯洁模式
    var aa = 0;
    $('.music_only').click(function () {
        if (aa == 0) {
            tiaomu = 4;
            $('.content_left').css({
                display: "none"
            })
            $('.content_right').css({
                float: "none",
                margin: "auto",
                display: "block"
            })
            $('.song_lyric_container').css({
                height: "50%",
                marginTop: "20%"
            })
            aa = 1;
        } else {
            tiaomu = 2;
            $('.content_left').css({
                display: "block"
            })
            $('.content_right').css({
                float: "right",
                display: "none"

            })
            $('.song_lyric_container').css({
                height: "150px"
            })
            aa = 0;
        }

    })




});