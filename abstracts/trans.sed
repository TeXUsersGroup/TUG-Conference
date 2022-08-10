s/\\acro{\([^}]*\)}/<span class=\"sm-caps\">\1<\/span>/g
s/---/—/g
s/--/–/g
s/\\Dash/–/g
s/``/“/g
s/''/”/g
s/`/‘/g
s/'/’/g
s/\\TikZ/Ti<i>k<\/i>Z/g
s/\\url{\([^}]*\)}/<a href=\"\1\">link text<\/a>/g
s/\\subhead{\([^}]*\)}/<h2>\1<\/h2>/g
s/\\emph{\([^}]*\)}/<em>\1<\/em>/g
s/\\textit{\([^}]*\)}/<i>\1<\/i>/g
s/\\textsf{\([^}]*\)}/<span class=\"sans-serif\">\1<\/span>/g
s/\\textsc{\([^}]*\)}/<span class=\"sm-caps\">\1<\/span>/g
s/\\texttt{\([^}]*\)}/<tt>\1<\/tt>/g
s/\\code{\([^}]*\)}/<tt>\1<\/tt>/g
s/\\cs{\([^}]*\)}/<tt>\1<\/tt>/g
s/\\textbf{\([^}]*\)}/<b>\1<\/b>/g
s/\\LuaLaTeX\([\\, ,,,\.,:,{},2,3,4,’,-,)]\)/Lua<span class=\"latex\">L<span>a<\/span>T<span>e<\/span>X<\/span>\1/g
s/\\LuaTeX\([\\, ,,,\.,:,{},2,3,4,’,-,)]\)/Lua<span class=\"tex">T<span>e<\/span>X<\/span>\1/g
s/\\AllTeX\([\\, ,,,\.,:,{},2,3,4,’,-,)]\)/All<span class=\"tex">T<span>e<\/span>X<\/span>\1/g
s/\\LaTeX\([ ,,,\.,:,2,3,4,’,-,)]\)/<span class=\"latex\">L<span>a<\/span>T<span>e<\/span>X<\/span>\1/g
s/\\LaTeX{}/<span class=\"latex\">L<span>a<\/span>T<span>e<\/span>X<\/span>/g
s/\\LaTeX\\/<span class=\"latex\">L<span>a<\/span>T<span>e<\/span>X<\/span>/g
s/\\XeTeX\([\\, ,,,\.,:,{},2,3,4,’,-,)]\)/<span class=\"xetex\">X<span>\&#398;<\/span>T<span>e<\/span>X<\/span>\1/g
s/\\Xe\\/<span class=\"xesomething\">X<span>\&#398;<\/span>/g
s/\\Xe{}/<span class=\"xesomething\">X<span>\&#398;<\/span>/g
s/\\eTeX\([\\, ,,,\.,:,{},2,3,4,’,-,)]\)/<span class=\"tex">T<span>e<\/span>X<\/span>\1/g
s/\\TeX-/<span class=\"tex">T<span>e<\/span>X<\/span>-/g
s/\\LaTeX-/<span class=\"latex\">L<span>a<\/span>T<span>e<\/span>X<\/span>-/g
s/\\LaTeXe/<span class=\"latex\">L<span>a<\/span>T<span>e<\/span>X<\/span> 2ε/g
s/\\TeX\([ ,,,\.,:,2,3,4,’,-,)]\)/<span class=\"tex">T<span>e<\/span>X<\/span>\1/g
s/\\TeX{}/<span class=\"tex">T<span>e<\/span>X<\/span>/g
s/\\TeX\\/<span class=\"tex">T<span>e<\/span>X<\/span>/g
s/\\ / /g
s/\\$//g
s/\\ldots/\.\.\./g
s/\\href{\(.*\)}{\(.*\)}/<a href=\"\1\">\2<\/a>/g
s/\\begin{itemize}/<\/p> <div class=\"row\"> <div class=\"column\"> <ul>/
s/\\end{itemize}/<\/ul> <\/div> <\/div> <p>/
s/\\begin{enumerate}/<\/p> <div class=\"row\"> <div class=\"column\"> <ol>/
s/\\end{enumerate}/<\/ol> <\/div> <\/div> <p>/
s/\\item \([^}]*\)/<li> \1 <\/li>/
s/^$/    <br \/> <br \/>/
