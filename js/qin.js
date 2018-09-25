window.onload = function () {
    bomb();
    //弹性
    function bomb(){
        var qin = $('.qin');
        for(var i=0;i<qin.length;i++){
            // qin.eq(i).css("width",qin.eq(i).width());
            qin.eq(i).css("height",qin.eq(i).height(14));
            var aHtml=qin.eq(i).html().split("");
            for(var j=0;j<aHtml.length;j++)
            {
                aHtml[j]="<span>"+aHtml[j]+"</span>"
            }
            qin.eq(i).html(aHtml.join(""));
        }
        var aSpan=$(".qin span");
        for(var i=0;i<aSpan.length;i++){
            aSpan.eq(i).css("left",aSpan.eq(i).position().left+"px");
        }
        aSpan.css("position","absolute");
        var iStartTop=aSpan.position().top;
        var iMinTop=-18;
        var iMaxTop=18;
        var obj = null;
        aSpan.on('mouseenter',aaa);
        function aaa(ev){
            this.parentNode.onmouseout=null;
            this.parentNode.onmousemove=null;
            var ev=ev||event;
            var iStartY=ev.clientY;
            obj=$(this);
            this.parentNode.onmousemove=function(ev){
                $(this).find('span').off('mouseenter',aaa);
                $(this).find('span').on('mouseenter',bbb);
                var iMouseY=ev.clientY;
                var iTop=iStartTop+(iMouseY-iStartY);
                var aSpan=$(this).find("span");
                var iIndex=obj.index();
                aSpan.stop();
                if(iTop<iMinTop || iTop>iMaxTop){
                    aSpan.animate({top:iStartTop},500,"easeOutElastic");
                    $(this).find('span').on('mouseenter',aaa);
                    $(this).find('span').off('mouseenter',bbb);
                    this.onmouseleave=null;
                    this.onmousemove=null;
                }
                else{
                    for(var i=0;i<aSpan.length;i++){
                        if(iMouseY>iStartY){
                            var iSpanTop=iTop-Math.abs(i-iIndex);
                            if(iSpanTop<iStartTop)
                            {
                                iSpanTop=iStartTop;
                            }
                        }
                        else if(iMouseY<iStartY){
                            var iSpanTop=iTop+Math.abs(i-iIndex);
                            if(iSpanTop>iStartTop){
                                iSpanTop=iStartTop;
                            }
                        }
                        aSpan.eq(i).css("top",iSpanTop+"px");
                    }
                }

                this.onmouseleave=function(){
                    aSpan.animate({top:iStartTop},500,"easeOutElastic");
                    $(this).find('span').on('mouseenter',aaa);
                    $(this).find('span').off('mouseenter',bbb);
                    this.onmouseleave=null;
                    this.onmousemove=null;
                };
            };
        }
        function bbb(){
            obj=$(this);
        }
    }
}