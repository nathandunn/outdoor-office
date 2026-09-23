import sys
e=open('engine.js').read(); s=open('style.css').read(); p=open('page.html').read()
assert '/*__ENGINE__*/' in p and '/*__STYLE__*/' in p
open(sys.argv[1] if len(sys.argv)>1 else 'index.html','w').write(p.replace('/*__STYLE__*/', s).replace('/*__ENGINE__*/', e))
