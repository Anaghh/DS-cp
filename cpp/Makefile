CXX = g++
CXXFLAGS = -std=c++17 -Wall -O2

TARGETS = bin/algo1 bin/algo2 bin/algo3 bin/algo4

all: $(TARGETS)

bin/algo1: algorithm1-greedy.cpp
	$(CXX) $(CXXFLAGS) -o $@ $^

bin/algo2: algorithm2-dfs.cpp
	$(CXX) $(CXXFLAGS) -o $@ $^

bin/algo3: algorithm3-unionfind.cpp
	$(CXX) $(CXXFLAGS) -o $@ $^

bin/algo4: algorithm4-heap.cpp
	$(CXX) $(CXXFLAGS) -o $@ $^

clean:
	rm -f bin/algo*

.PHONY: all clean
