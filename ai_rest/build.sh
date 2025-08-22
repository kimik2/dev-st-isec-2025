# export CGO_ENABLED=1
# export CXX=g++
# export CGO_CXXFLAGS="-std=c++11"
# export CGO_LDFLAGS="-L./lib -lST_EXT_AI_Core"

go build 
mv ai_rest ./bin