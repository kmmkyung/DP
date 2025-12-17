<!-- 연결 -->
$.ajax({
    type: "POST",
    url: "./plantListQuestion.php",
    data: formData,
    dataType: "json",
    success: function(res) {
       console.log(res);
        if(res.data) {
            if(reset) { $(".content-list").html(res.data); } // 필터/검색 시 초기화
            else { $(".content-list").append(res.data); } // 더보기 시 추가
            pg++;
            if(pg > res.totalPage) $(".more-box").hide();
            else $(".more-box").show();
        } 
		else {
            // 데이터 없을 때
            $(".content-wrap").find(".content-list").remove();
			$(".content-wrap").append('<div class="plant-noSearch"><img src="/images/page/m71_icon1.png" alt=""><p>해당되는 식물이 없습니다.</p></div>');
            $(".more-box").hide();
        }
    },
    error: function(err) {
        console.log(err);

    }
});


<!-- 통신 -->
<?php
$ghPath = '../';
include_once($ghPath.'include/common/common.php');
$data .= '';
$_json_array = array(
    "result"		=> $result,
    "data"		=> $data,
);
echo urldecode(json_encode($_json_array));
?>
