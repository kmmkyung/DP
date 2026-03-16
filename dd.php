<?php $pn=2; $sn=2; $cate == '';
include "_sub_top.php";
$cate = isset($_GET['cate']) ? (int)$_GET['cate'] : 1;
?>

<div id="main" class="m00 m<?=$pn?>0 m<?=$pn?><?=$sn?>0 m<?=$pn?><?=$sn?><?=$cate?>">

	<section class="section section1">
		<div class="tabWarp">
			<?php include "m220_btn.php" ?>
		</div>
		<div class="innerwrap">

			
			<!-- 기존 m221 ~ m226까지 따로 페이지 만들었다가 m221에 통합했습니다 -->
			<?php if($cate == 1){ ?>
			<div class="conWrap">
				<div class="titWrap">
					<div class="pageTit">공공 하·폐수</div>
					<p>
						공공 하폐수 처리시설의 안정적인 운영과 체계적인 관리를 제공합니다. <br class="pcbr">
						국내 민간운영 최대 규모 하수 처리시설 운영관리 실적을 보유하고 있으며, 처리수 <br class="pcbr">
						재이용을 통한 하천유지용수를 공급해 환경보전에 기여하고 있습니다.
					</p>
				</div>
				<div class="imgWrap"><img src="/images/page/m221_sec1_img.jpg" alt=""></div>
			</div>
			<?php } else if($cate == 2){  ?>
			<div class="conWrap">
				<div class="titWrap">
					<div class="pageTit">산업폐수 · 순수 <br class="pcbr">초순수 · 재이용</div>
					<p>
						전자, 디스플레이 등 산업 전분야에서 쌓은 산업폐수 처리, 순수, <br class="pcbr">
						초순수 공급 등에 대한 풍부한 운영 경험과 차별화된 기술력으로 양질의 <br class="pcbr">
						운영관리 서비스를 제공합니다.
					</p>
				</div>
				<div class="imgWrap"><img src="/images/page/m222_sec1_img.jpg" alt=""></div>
			</div>
			<?php } else if($cate == 3){  ?>
			<div class="conWrap">
				<div class="titWrap">
					<div class="pageTit">폐기물 처리 및 에너지화</div>
					<p>
						음식물, 하수슬러지, 생활쓰레기 등 버려지는 폐기물의 <br class="pcbr">
						자원화, 에너지화로 폐기물 처리과정에서의 <br class="pcbr">
						환경오염을 최소화함으로써 <br class="pcbr">
						자연환경과 생활환경을 보호하고 있습니다.
					</p>
				</div>
				<div class="imgWrap"><img src="/images/page/m223_sec1_img.jpg" alt=""></div>
			</div>
			<?php } else if($cate == 4){  ?>
			<div class="conWrap">
				<div class="titWrap">
					<div class="pageTit">대기 오염 방지</div>
					<p>
						사업장에서 발생하는 유해가스 및 악취 가스 등을 처리하는 <br class="pcbr">
						대기오염방지시설을 체계적인 시스템과 <br class="pcbr">
						전문적인 인력 운용을 통해 <br class="pcbr">
						안정적으로 운영합니다.
					</p>
				</div>
				<div class="imgWrap"><img src="/images/page/m224_sec1_img.jpg" alt=""></div>
			</div>
			<?php } else if($cate == 5){  ?>
			<div class="conWrap">
				<div class="titWrap">
					<div class="pageTit">민간투자사업</div>
					<p>
						BTO, BTL 등 다양한 형태의 사업 모델을 운영하며, 정교화된 유지관리를 통한 <br class="pcbr">
						시설 운영 효율 증대, 방류수역 수질개선 등 고객에게 최상의 서비스를 <br class="pcbr">
						제공할 뿐만 아니라 쾌적한 생활환경 조성에 최선을 다하고 있습니다.
					</p>
					<div class="exp">
						<dl>
							<dt>BTO(Build Transfer Operate)</dt>
							<dd>민간사업자가 시설을 건설하고 정부에 소유권을 양도한 뒤 일정 기간 직접 시설을 <br class="pcbr">운영하면서 수익을 거두는 사업.</dd>
						</dl>
						<dl>
							<dt>BTL(Build Transfer Lease)</dt>
							<dd>민간사업자가 시설을 건설하고 정부가 임대해서 이용하는 방식을 적용한 사업.</dd>
						</dl>
					</div>
				</div>
				<div class="imgWrap"><img src="/images/page/m225_sec1_img.jpg" alt=""></div>
			</div>	
			<?php } else if($cate == 6){  ?>
			<div class="conWrap">
				<div class="titWrap">
					<div class="pageTit">해외 사업장</div>
					<p>
						2013년 업계 최초로 중국 등 해외 환경 운영관리사업에 진출해 <br class="pcbr">
						글로벌 시장에서도 두각을 나타내고 있습니다.
					</p>
				</div>
				
				<div class="imgWrap"><img src="/images/page/m226_sec1_img.jpg" alt=""></div>
			</div>
			
			<div class="map">
				<img src="/images/page/m226_sec1_map.png" alt="">
			</div>
			<?php } else if($cate == 7){  ?>
			<div class="conWrap">
				<div class="titWrap">
					<div class="pageTit">분뇨·가축 분뇨</div>
					<p>
						분뇨 및 가축분뇨의 친환경적 처리를 통해 지역 사회에 쾌적한 생활 환경을 제공합니다. <br class="pcbr">
						악취 저감 및 고도 정화 기술을 바탕으로 수질 오염을 원천 차단하고 있으며, <br class="pcbr">
						주민 친화적인 시설 운영으로 지역 사회와의 상생에 기여하고 있습니다.
					</p>
				</div>
				<div class="imgWrap"><img src="/images/page/m227_sec1_img.png" alt=""></div>
			</div>
			<?php } ?>
			
			
		</div>
	</section>
	<?php if($cate!==7){?>
	<section class="section section2">
		<div class="innerwrap">
			<div class="secTit"><?php if($cate==6){?><span>해외 사업장</span><?php }?>주요사업</div>
			<div class="slideWrap">
				<div class="btns">
					<div class="vprev"><img src="/images/page/m220_slide_prev.png" alt=""></div>
					<div class="vnext"><img src="/images/page/m220_slide_next.png" alt=""></div>
				</div>
				
				<div class="swiper-container business">
					
					<div class="swiper-wrapper">
						<?php
                    	$where = "where 1=1";
                    	if($cate){
                    		$where .= " and c_code = :cate ";
                    		$bindParam[] = array('cate', $cate);
                    	}else{
                    	    
                    	    $where .= " and c_code = :cate ";
                    	    $bindParam[] = array('cate', 1);
                    	}
                    	
                    	$tableName = 'gh_major_table';
                    	$orderby = "num desc|idx desc";
                    	$listResult = $queryLibrary->getList($where,$bindParam,$tableName,$orderby,1,1000);
                    	$number = $listResult['number'];
                    	foreach($listResult['result'] as $d){
                	    if (!empty($d['p_spec'])) {
                	        $specData = json_decode($d['p_spec'], true);
                	    }else{
                	        $specData = array();
                	    }
                    	$regdate= substr($d['regdate'],0,10);
                    ?>
						<a class="swiper-slide" data-idx="<?php echo $d["idx"];?>">
							<div class="thumb">
							<?php if($d['file1']){?>
							<img src="./data/major/<?=$d['file1']?>" alt="">
							<?php }?>
							</div>
							<div class="titWrap">
								<div class="cate"><?php echo $_majorCategory[$d['c_code']]??null;?></div>
								<div class="name"><?=$d['title']?></div>
							</div>
							<div class="infoWrap">
							<?php $items = [];

									// 카테고리별 항목 설정
									switch ($cate) {
											case 1:
													$items[] = ['처리공법', $d['text1']];
													$items[] = ['시설용량', $d['text2']];
													$items[] = ['재이용', $d['text3']];
													break;
											case 2:
													$items[] = ['시설용량', $d['text2']];
													break;
											case 3:
													$items[] = ['처리공법', $d['text1']];
													$items[] = ['시설용량', $d['text2']];
													$items[] = ['운영기간', $d['text3']];
													break;
											case 4:
    											    if(count($specData['spec'] ??= array()) > 0){
    											        for($i=0;$i<count((array)$specData['spec']);$i++){
    											            $specData['spec'][$i]['specContent'] = html_entity_decode($specData['spec'][$i]['specContent']);
    											            $items[] = [$specData['spec'][$i]['specTitle'], $specData['spec'][$i]['specContent']];
    											        }
    											    }
													break;
											case 5:
													$items[] = ['처리용량', $d['text2']];
													$items[] = ['공법', $d['text1']];
													$items[] = ['슬러지 처리방법', $d['text3']];
													break;
											case 6:
													$items[] = ['공정수', $d['text1']];
													$items[] = ['재이용', $d['text3']];
													$items[] = ['폐수', $d['text3']];
													break;
									}

									foreach ($items as $item): ?>
											<dl>
													<dt><?= $item[0] ?></dt>
													<dd><?= $item[1] ?></dd>
											</dl>
									<?php endforeach; ?>
								
							</div>
							<div class="btn"><span>VIEW MORE</span></div>
						</a>
						<?php }?>
						
					</div>
				</div>
			</div>
		</div>
	</section>
	<?php if($cate==2 || $cate==4){?> <!-- section4 추가 -->
	<section class="section section4">
		<div class="innerwrap">
			<div class="secTit"><?php if($cate==2){?><span>전국 폐수처리장</span><?php }?><?php if($cate==4){?><span>전국 대기방지시설</span><?php }?> 운영 현황</div>
			<div class="container container1">
				<div class="content content1">
					<div class="imgBox">
						<?php if($cate==2){?> <img src="/images/page/m222_sec4_img1.png" alt=""> <?php }?>
						<?php if($cate==4){?> <img src="/images/page/m224_sec4_img1.png" alt=""> <?php }?>
					</div>
						<p class="imgTitle">
							<?php if($cate==2){?><span>폐수처리장 총 25개소</span><?php }?><?php if($cate==4){?><span>대기방지시설 총 8개소</span><?php }?> 운영 중
						</p>
						<span class="imgCaption">민간사업소</span>
				</div>
				<div class="content content2">
					<span class="contentCaption">
						<?php if($cate==2){?><span>폐수처리장</span><?php }?><?php if($cate==4){?><span>대기방지시설</span><?php }?> Capa 합계
					</span>
					<?php if($cate==2){?>
						<div class="capsBox">
							<p class="capsTitle">디스플레이 · 전자 · 소재 분야</p>
							<ul class="capsList">
								<li class="listItem">
									<p class="itemTitle">디스플레이 (파주/구미)</p><p class="itemText">474,290㎥/일</p>
								</li>
								<li class="listItem">
									<p class="itemTitle">전자 (양재/평택/창원)</p><p class="itemText">7,382㎥/일</p>
								</li>
								<li class="listItem">
									<p class="itemTitle">이노텍 (파주/구미)</p><p class="itemText">47,200 ㎥/일</p>
								</li>
								<li class="listItem">
									<p class="itemTitle">그 外 (반도체·배터리 등)</p><p class="itemText">59,100㎥/일</p>
								</li>
							</ul>
						</div>
						<div class="capsBox">
							<p class="capsTitle">철강 · 에너지 · 산업재 분야</p>
							<ul class="capsList">
								<li class="listItem">
									<p class="itemTitle">철강 (당진)</p><p class="itemText">급배수  174,000㎥/일</p>
								</li>
								<li class="listItem">
									<p class="itemTitle">강관제조 (임실)</p><p class="itemText">냉각수  3,459㎥/hr</p>
								</li>
								<li class="listItem">
									<p class="itemTitle">에너지(여주/청주)</p><p class="itemText">폐수  4,000㎥/일</p>
								</li>
							</ul>
						</div>
						<div class="capsBox">
							<p class="capsTitle">제약 · 식품 · 포장재 분야</p>
							<ul class="capsList">
								<li class="listItem">
									<p class="itemTitle">제약 (평택)</p><p class="itemText">1,400㎥/일</p>
								</li>
								<li class="listItem">
									<p class="itemTitle">식품 (평택)</p><p class="itemText">1,000㎥/일</p>
								</li>
								<li class="listItem">
									<p class="itemTitle">포장재 (진천)</p><p class="itemText">5,970㎥/일</p>
								</li>
							</ul>
						</div>
					<?php }?>
					<?php if($cate==4){?>
						<div class="capsBox">
							<p class="capsTitle">전자 · 소재 분야</p>
							<ul class="capsList">
								<li class="listItem">
									<p class="itemTitle">전자 (양재/평택/마곡)</p>
									<p class="itemText">48,597㎥/min</p>
								</li>
								<li class="listItem">
									<p class="itemTitle">이노텍 (파주/구미)</p>
									<p class="itemText">16,710 ㎥/min</p>
								</li>
								<li class="listItem">
									<p class="itemTitle">그 外 (반도체·배터리 등)</p>
									<p class="itemText">32,695㎥/min</p>
								</li>
							</ul>
						</div>
					<?php }?>
				</div>
			</div>
		</div> 
	</section> 
<?php }?> 
	<?php }?>
	<?php
    	$where = "where 1=1";
    	if($cate){
    		$where .= " and c_code = :cate ";
    		$bindParam[] = array('cate', $cate);
    	}
    	if($keyword){
    	    $where = $where." and (title like :keyword or text1 like :keyword or text2 like :keyword or text3 like :keyword )";
    	    $bindParam[] = array('keyword', $keyword,'like');
    	}
    	$tableName = 'gh_business_table';
    	$orderby = "num desc|idx desc";
  
    	$listResult = $queryLibrary->getList($where,$bindParam,$tableName,$orderby,$pg,10);
    	$number = $listResult['number'];
    ?>
    <?php if($number>0){?>
	<section class="section section3" id="section3">
		<div class="innerwrap">
			<div class="top">
				<div class="secTit"><?php if($cate==6){?><span>해외 사업장</span><?php }?>상세실적</div>
				<form name="SearchForm" method="get" id="searchForm" class="searchForm">
					<input type="hidden" name="keyword" value="<?php echo $keyword;?>">
					<div class="searchwrap">
						<input type="text" class="form-input" name="keyword" value="" placeholder="검색어를 입력하세요">
						<button class="submit-btn"><img src="/images/page/icon_search.png" alt="검색하기"></button>
					</div>
				</form>
			</div>
			<?php
				$columns = [];
				switch ($cate) {
						case 1:
								$columns = ['사업명', '용량', '발주처', '공법'];
								break;
						case 2:
								$columns = ['사업소명', '시설용량', '주요적용공법'];
								break;
						case 3:
								$columns = ['사업명', '용량', '발주처', '공법'];
								break;
						case 4:
								$columns = ['사업소명', '흡수탑 용량', '흡착탑 용량', '여과집진설비 용량', 'RTO설비 용량'];
								break;
						case 5:
								$columns = ['사업명', '관로연장', '발주처'];
								break;
						case 6:
								$columns = ['사업명', '용량', '주용적용공법'];
								break;
						case 7:
								$columns = ['구분', '사업명', '용량(㎥/day)','발주처','공법'];
								break;
				}
				?>
			<div class="tableWrap">
				<table cellpadding="0" cellspacing="0">
					<colgroup>
					<?php foreach ($columns as $col): ?>
							<col>
					<?php endforeach; ?>
					</colgroup>
					<tr>
						<tr>
						<?php foreach ($columns as $col): ?>
								<th><?= $col ?></th>
						<?php endforeach; ?>
						</tr>
					</tr>
							<?php 
								foreach($listResult['result'] as $d){
								$regdate= substr($d['regdate'],0,10);
							?>
					<tr>
						<?php if($cate==1){?>
						<td><?php echo $d["title"];?></td>
						<td><?php echo $d["text1"];?></td>
						<td><?php echo $d["text2"];?></td>
						<td><?php echo $d["text3"];?></td>
						<?php }else if($cate==2){?>
						<td><?php echo $d["title"];?></td>
						<td><?php echo $d["text1"];?></td>
						<td><?php echo $d["text2"];?></td>
						<?php }else if($cate==4){?>
						<td><?php echo $d["title"];?></td>
						<td><?php echo $d["text1"];?></td>
						<td><?php echo $d["text2"];?></td>
						<td><?php echo $d["text3"];?></td>
						<td><?php echo $d["text4"];?></td>
						<?php }else if($cate==5){?>
						<td><?php echo $d["title"];?></td>
						<td><?php echo $d["text1"];?></td>
						<td><?php echo $d["text2"];?></td>
						<?php }else if($cate==6){?>
						<td><?php echo $d["title"];?></td>
						<td><?php echo $d["text1"];?></td>
						<td><?php echo $d["text3"];?></td>
						<?php }else if($cate==7){?>
						<td><?php echo $d["text1"];?></td>
						<td><?php echo $d["title"];?></td>
						<td><?php echo $d["text3"];?></td>
						<td><?php echo $d["text4"];?></td>
						<td><?php echo $d["text5"];?></td>
						<?php }else{?>
						<td><?php echo $d["title"];?></td>
						<td><?php echo $d["text1"];?></td>
						<td><?php echo $d["text2"];?></td>
						<td><?php echo $d["text3"];?></td>
						<?php }?>
					</tr>
					<?php }?>
				</table>
			</div>			
			<div class="paging">
				<?=$funcLibrary->getUserPaging($_config['pageListEa'],$pg,$listResult['totalPage'], $_SERVER['PHP_SELF'].'?'.$funcLibrary->queryString('pg').'pg=',"#section3")?>
			</div>
			
		</div>
	</section>
	<?php }?>
	<div class="popup">
		<div class="popupContainer">
				<div class="iframeWrap">
					<button class="closeBtn"></button>
				 <iframe id="popupFrame" frameborder='0' scrolling='no' style='overflow-x:hidden; overflow:hidden; width:100%;min-height:500px;height: 530px;'></iframe>
				</div>
		</div>
		<div class="popupBg"></div>
	</div>

</div>


<script>
$(function(){
const btn = document.querySelector(".m220 .tabWarp");
const head = document.querySelector(".head");

let tabTop = 0;   // 버튼 기준 위치
let trigger = 0;  // fixed 시작 위치

function updateOffset() {
    // 현재 버튼의 top 값과 헤더 높이를 기반으로 trigger 계산
    const rect = btn.getBoundingClientRect();
    const currentTop = parseInt(getComputedStyle(btn).top) || 0;
    const headHeight = head.offsetHeight;

    tabTop = rect.top + window.scrollY - headHeight;
    trigger = tabTop - currentTop;
}

// 초기 계산
updateOffset();

// 리사이즈 시 재계산
window.addEventListener("resize", updateOffset);

// 스크롤 시 fixed 처리
window.addEventListener("scroll", function () {
    if (window.scrollY > trigger) {
        btn.classList.add("fixed");
    } else {
        btn.classList.remove("fixed");
    }
});

/*
const btn = document.querySelector(".m220 .tabWarp");
const head = document.querySelector(".head");

let tabTop = 0;
let trigger = 0;

let lastScrollY = window.scrollY;

function updateOffset() {
    const rect = btn.getBoundingClientRect();
    const currentTop = parseInt(getComputedStyle(btn).top) || 0;
    const headHeight = head.offsetHeight;

    tabTop = rect.top + window.scrollY - headHeight;
    trigger = tabTop - currentTop;
}

updateOffset();
window.addEventListener("resize", updateOffset);

window.addEventListener("scroll", function () {
    const currentScrollY = window.scrollY;


    if (currentScrollY > trigger) {
        btn.classList.add("fixed");
    } else {
        btn.classList.remove("fixed");
    }


    if (currentScrollY > lastScrollY && btn.classList.contains("fixed")) {
        btn.style.transform = "translateY(-120%)";
    } else {
        btn.style.transform = "translateY(0)";
    }

    lastScrollY = currentScrollY;
});
*/
	var swiper1 = new Swiper('.business', {
		slidesPerView: '3',
		speed: 1400,
		spaceBetween:32,
		loop: false,
		observers : true,
		observerParents: true,
		navigation: {
			nextEl: ".vnext",
			prevEl: ".vprev",
		},
		breakpoints: {
			1399: {
				slidesPerView: '2',
			},
			812: {
				slidesPerView: '1',
			},
			
		}
	});
});

</script>
<script>
$(function(){
    const popup = document.querySelector(".popup");
    const popupFrame = document.querySelector("#popupFrame");
    const popupCloseBtn = document.querySelector(".closeBtn");
    const popupButtons = document.querySelectorAll(".section2 .business .btn");

    // iframe 높이 조절 함수
	function resizeIframe() {
    if (!popupFrame) return;

    try {
        const iframeDoc = popupFrame.contentWindow.document;
        const box = iframeDoc.querySelector(".box");

        if (!box) return;

        const boxHeight = box.offsetHeight;   // .box 높이
        console.log("box height:", boxHeight);

        popupFrame.style.height = boxHeight + "px";

    } catch (e) {
        console.log("iframe resize error", e);
    }
}

    // 버튼 클릭 → iframe src 변경 + 팝업 열기
		function getQueryParam(param) {
			const urlParams = new URLSearchParams(window.location.search);
			return urlParams.get(param);
	}

    popupButtons.forEach(btn => {
        btn.addEventListener("click", function(){
					   const cate = getQueryParam('cate') || 1;
            const idx = this.closest(".swiper-slide").dataset.idx;
            popupFrame.src = `/m221_popup.php?idx=${idx}&cate=${cate}`;
            popup.classList.add("on");
        });
    });

    // iframe load 시 높이 조절
    popupFrame.addEventListener("load", resizeIframe);

    // 창 리사이즈 시 높이 재조정
    window.addEventListener("resize", resizeIframe);

    // 팝업 닫기
    if(popupCloseBtn){
        popupCloseBtn.addEventListener("click", function(){
            popup.classList.remove("on");
            popupFrame.src = ""; // iframe 초기화
        });
    }
		


	
		
		
});
</script>


<?php
include "_sub_bottom.php";
?>


