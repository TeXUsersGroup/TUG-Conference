# TUG'22 Tectonic keynote

45 minutes total, aim for 35+10

- Serving: `npx http-server`.
- [Standard view](http://localhost:8080/index.html)
- [Bounding-box debug version](http://localhost:8080/index.html?bbdebug)


## Submission

Title: "The Tectonic Project: Envisioning a 21st-Century TeX experience"

Tectonic is a software project built around an alternative TeX engine forked
from XeTeX. It was created to explore the answers to two questions. The first
question relates to documents: in a world of 21st-century technologies — where
interactive displays, computation, and internet connectivity are generally cheap
and ubiquitous — what new forms of technical document have become possible? The
second question relates to tools: how can we use those same technologies to do a
better job of empowering people to create excellent technical documents? The
answers are, of course, intertwined: without a system of great tools, it’s hard
(or perhaps impossible?) to create great documents. The premises of the Tectonic
project are that the world needs and deserves a “21st-century” document
authoring system, that such a system should have TeX at its heart — and that in
order to create a successful system, parts of the classic TeX experience will
need to be rethought or jettisoned completely. This is why Tectonic forks XeTeX
and is branded independently: while it aspires to maintain compatibility with
classic TeX workflows as far as can be managed, in a certain sense the whole
point of the effort is to break compatibility and ignore tradition — to
experiment with new ideas that can’t be tried in mainline TeX. Thus far, these
“new ideas” have focused on experience design, seeking to deliver a system that
is convenient, empowering, and even delightful for users and developers.
Tectonic is therefore compiled using standard Rust tools, installs as a single
executable file, and downloads support files from a prebuilt TeX Live
distribution on demand. In the past year, long-threatened work on native HTML
output has finally started landing, including a possibly novel Unicode math
rendering scheme based on font subsetting. The goal for upcoming work is to
flesh out this HTML support so that Tectonic can create the world’s best
web-native technical documents, and to use that support to document the Tectonic
system itself.